import secrets

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import (
    ERR_OAUTH_ALREADY_BOUND,
    ERR_OAUTH_NOT_BOUND,
    ERR_OAUTH_PROVIDER_INVALID,
    ERR_OAUTH_STATE_INVALID,
    ERR_OAUTH_TOKEN_FAILED,
    ROLE_USER,
)
from app.exceptions import AppException
from app.models.oauth_account import OAuthAccount
from app.models.role import SysRole
from app.models.user import SysUser
from app.models.user_profile import SysUserProfile
from app.redis import redis_client
from app.security import create_access_token, create_refresh_token

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_API = "https://api.github.com/user"
GITHUB_EMAILS_API = "https://api.github.com/user/emails"

OAUTH_STATE_PREFIX = "oauth_state:"
OAUTH_STATE_TTL = 600

OAUTH_PROVIDERS = {
    "github": {
        "name": "GitHub",
        "icon": "mdi:github",
        "color": "#24292e",
        "enabled": bool(settings.github_client_id),
    },
}


def _generate_state(provider: str) -> str:
    return f"{provider}.{secrets.token_urlsafe(32)}"


async def _store_state(state: str, provider: str, redirect_uri: str | None = None) -> None:
    key = f"{OAUTH_STATE_PREFIX}{state}"
    value = provider
    if redirect_uri:
        value = f"{provider}|{redirect_uri}"
    await redis_client.setex(key, OAUTH_STATE_TTL, value)


async def _verify_and_consume_state(state: str, provider: str) -> str | None:
    """验证并消费 OAuth state。返回 stored redirect_uri (可能为 None)。state 无效时抛出异常。"""
    key = f"{OAUTH_STATE_PREFIX}{state}"
    value = await redis_client.get(key)
    if value is None:
        raise AppException(ERR_OAUTH_STATE_INVALID, "OAuth state无效或已过期")
    await redis_client.delete(key)
    if "|" in value:
        stored_provider, redirect_uri = value.split("|", 1)
    else:
        stored_provider, redirect_uri = value, None
    if stored_provider != provider:
        raise AppException(ERR_OAUTH_STATE_INVALID, "OAuth state无效或已过期")
    return redirect_uri


def get_oauth_providers() -> list[dict]:
    return list(OAUTH_PROVIDERS.values())


async def get_authorize_url(provider: str, redirect_uri: str | None = None) -> dict:
    if provider not in OAUTH_PROVIDERS or not OAUTH_PROVIDERS[provider]["enabled"]:
        raise AppException(ERR_OAUTH_PROVIDER_INVALID, f"不支持的OAuth提供商: {provider}")

    state = _generate_state(provider)
    await _store_state(state, provider, redirect_uri)

    target_redirect = redirect_uri or settings.github_redirect_uri

    params = {
        "client_id": settings.github_client_id,
        "redirect_uri": target_redirect,
        "state": state,
        "scope": "user:email",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    authorize_url = f"{GITHUB_AUTHORIZE_URL}?{query}"

    return {"authorizeUrl": authorize_url, "state": state}


async def _get_github_user(access_token: str) -> dict:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.get(GITHUB_USER_API, headers=headers)
        if resp.status_code != 200:
            raise AppException(ERR_OAUTH_TOKEN_FAILED, "获取GitHub用户信息失败")
        user_data = resp.json()

        emails_resp = await client.get(GITHUB_EMAILS_API, headers=headers)
        emails = emails_resp.json() if emails_resp.status_code == 200 else []
        primary_email = ""
        for email in emails:
            if email.get("primary") and email.get("verified"):
                primary_email = email["email"]
                break
        if not primary_email and emails:
            primary_email = emails[0].get("email", "")

        return {
            "provider_user_id": str(user_data["id"]),
            "provider_username": user_data.get("login", ""),
            "nickname": user_data.get("name") or user_data.get("login", ""),
            "avatar_url": user_data.get("avatar_url", ""),
            "email": primary_email,
            "access_token": access_token,
        }


async def oauth_login(provider: str, code: str, state: str, db: AsyncSession) -> dict:
    if provider not in OAUTH_PROVIDERS or not OAUTH_PROVIDERS[provider]["enabled"]:
        raise AppException(ERR_OAUTH_PROVIDER_INVALID, f"不支持的OAuth提供商: {provider}")

    redirect_uri = await _verify_and_consume_state(state, provider)

    async with httpx.AsyncClient(verify=False) as client:
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri or settings.github_redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            raise AppException(ERR_OAUTH_TOKEN_FAILED, "GitHub授权码交换失败")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise AppException(ERR_OAUTH_TOKEN_FAILED, "获取GitHub access_token失败")

    github_user = await _get_github_user(access_token)

    existing_oauth = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == github_user["provider_user_id"],
        )
    )
    existing_oauth = existing_oauth.scalar()

    if existing_oauth:
        user = await db.get(SysUser, existing_oauth.user_id)
        if not user or user.deleted:
            raise AppException(ERR_OAUTH_TOKEN_FAILED, "关联的用户不存在")

        existing_oauth.access_token = github_user["access_token"]
        existing_oauth.provider_username = github_user["provider_username"]

        user_role_result = await db.execute(
            select(SysRole.code)
            .select_from(SysRole)
            .join(SysRole.users)
            .where(SysUser.id == user.id)
        )
        roles = list(user_role_result.scalars().all())

        access_token_jwt = create_access_token(user.id, roles)
        refresh_token = create_refresh_token(user.id)

        return {
            "userId": user.id,
            "token": access_token_jwt,
            "refreshToken": refresh_token,
            "expiresIn": settings.jwt_expiration_seconds,
            "userInfo": {
                "id": user.id,
                "username": user.username,
                "nickname": user.nickname or user.username,
                "avatarUrl": user.avatar_url or "",
                "level": user.level,
                "experience": user.experience,
                "roles": roles,
            },
        }

    # Check if email exists and link to existing user
    user = None
    if github_user["email"]:
        existing_user = await db.execute(
            select(SysUser).where(SysUser.email == github_user["email"])
        )
        user = existing_user.scalar()

    if not user:
        role_user = await db.execute(select(SysRole).where(SysRole.code == ROLE_USER))
        role_user = role_user.scalar()

        username = github_user["provider_username"]
        base_username = username
        counter = 1
        while True:
            existing = await db.execute(
                select(SysUser).where(SysUser.username == username)
            )
            if not existing.scalar():
                break
            username = f"{base_username}{counter}"
            counter += 1

        user = SysUser(
            username=username,
            password_hash="",
            nickname=github_user["nickname"] or username,
            avatar_url=github_user["avatar_url"],
            email=github_user["email"],
        )
        if role_user:
            user.roles = [role_user]
        db.add(user)
        await db.flush()

        profile = SysUserProfile(user_id=user.id)
        db.add(profile)
        await db.flush()

    oauth_account = OAuthAccount(
        user_id=user.id,
        provider=provider,
        provider_user_id=github_user["provider_user_id"],
        provider_username=github_user["provider_username"],
        access_token=github_user["access_token"],
    )
    db.add(oauth_account)

    user_role_result = await db.execute(
        select(SysRole.code)
        .select_from(SysRole)
        .join(SysRole.users)
        .where(SysUser.id == user.id)
    )
    roles = list(user_role_result.scalars().all())

    access_token_jwt = create_access_token(user.id, roles)
    refresh_token = create_refresh_token(user.id)

    return {
        "userId": user.id,
        "token": access_token_jwt,
        "refreshToken": refresh_token,
        "expiresIn": settings.jwt_expiration_seconds,
        "userInfo": {
            "id": user.id,
            "username": user.username,
            "nickname": user.nickname or user.username,
            "avatarUrl": user.avatar_url or "",
            "level": user.level,
            "experience": user.experience,
            "roles": roles,
        },
    }


async def get_bind_status(user: SysUser, db: AsyncSession) -> list[dict]:
    oauth_result = await db.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user.id)
    )
    oauth_accounts = oauth_result.scalars().all()
    bound_map = {oa.provider: oa for oa in oauth_accounts}

    result = []
    for provider_key, info in OAUTH_PROVIDERS.items():
        oa = bound_map.get(provider_key)
        result.append({
            "provider": provider_key,
            "name": info["name"],
            "icon": info["icon"],
            "bound": oa is not None,
            "bindAt": oa.created_at.isoformat() if oa and oa.created_at else None,
        })
    return result


async def oauth_bind(
    user: SysUser, provider: str, code: str, state: str, db: AsyncSession
) -> None:
    if provider not in OAUTH_PROVIDERS or not OAUTH_PROVIDERS[provider]["enabled"]:
        raise AppException(ERR_OAUTH_PROVIDER_INVALID, f"不支持的OAuth提供商: {provider}")

    redirect_uri = await _verify_and_consume_state(state, provider)

    existing = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.user_id == user.id,
            OAuthAccount.provider == provider,
        )
    )
    if existing.scalar():
        raise AppException(ERR_OAUTH_ALREADY_BOUND, "该OAuth账号已绑定")

    async with httpx.AsyncClient(verify=False) as client:
        token_resp = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri or settings.github_redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise AppException(ERR_OAUTH_TOKEN_FAILED, "GitHub授权失败")

    github_user = await _get_github_user(access_token)

    # Check if this GitHub account is already bound to another user
    existing_provider = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == github_user["provider_user_id"],
        )
    )
    if existing_provider.scalar():
        raise AppException(ERR_OAUTH_ALREADY_BOUND, "该GitHub账号已绑定其他用户")

    oauth_account = OAuthAccount(
        user_id=user.id,
        provider=provider,
        provider_user_id=github_user["provider_user_id"],
        provider_username=github_user["provider_username"],
        access_token=github_user["access_token"],
    )
    db.add(oauth_account)


async def oauth_unbind(user: SysUser, provider: str, db: AsyncSession) -> None:
    oauth_result = await db.execute(
        select(OAuthAccount).where(
            OAuthAccount.user_id == user.id,
            OAuthAccount.provider == provider,
        )
    )
    oauth_account = oauth_result.scalar()
    if not oauth_account:
        raise AppException(ERR_OAUTH_NOT_BOUND, "未绑定该OAuth账号")

    await db.delete(oauth_account)
