from typing import Optional

from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import settings
from app.constants import (
    ERR_ACCOUNT_ABNORMAL,
    ERR_ACCOUNT_DISABLED,
    ERR_NOT_LOGGED_IN,
    ERR_PERMISSION_DENIED,
    ROLE_ADMIN,
    ROLE_SUPER_ADMIN,
)
from app.database import get_db
from app.exceptions import AppException
from app.models.user import SysUser
from app.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> SysUser:
    if not token:
        raise AppException(ERR_NOT_LOGGED_IN, "未登录或Token无效", 401)
    try:
        payload = decode_token(token)
    except ExpiredSignatureError:
        raise AppException(ERR_NOT_LOGGED_IN, "Token已过期，请重新登录", 401)
    except InvalidTokenError:
        raise AppException(ERR_NOT_LOGGED_IN, "Token无效", 401)
    if payload.get("type") != "access":
        raise AppException(ERR_NOT_LOGGED_IN, "Token类型错误", 401)

    user_id = int(payload["sub"])
    user = await db.get(SysUser, user_id)
    if not user or user.deleted:
        raise AppException(ERR_NOT_LOGGED_IN, "用户不存在", 401)
    if user.status == 0:
        raise AppException(ERR_ACCOUNT_DISABLED, "账号已被禁用", 403)
    if user.status == 2:
        raise AppException(ERR_ACCOUNT_ABNORMAL, "账号已被禁言", 403)
    return user


async def get_current_user_optional(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[SysUser]:
    if not token:
        return None
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            return None
        user_id = int(payload["sub"])
        user = await db.get(SysUser, user_id)
        if not user or user.deleted or user.status != 1:
            return None
        return user
    except (ExpiredSignatureError, InvalidTokenError):
        return None


def require_roles(*roles: str):
    async def checker(user: SysUser = Depends(get_current_user)):
        user_roles = await get_user_role_codes(user)
        if not set(roles) & set(user_roles):
            raise AppException(ERR_PERMISSION_DENIED, "权限不足", 403)
        return user
    return checker


def require_admin():
    async def checker(user: SysUser = Depends(get_current_user)):
        user_roles = await get_user_role_codes(user)
        if ROLE_ADMIN not in user_roles and ROLE_SUPER_ADMIN not in user_roles:
            raise AppException(ERR_PERMISSION_DENIED, "需要管理员权限", 403)
        return user
    return checker


def require_level(min_level: int):
    async def checker(user: SysUser = Depends(get_current_user)):
        if user.level < min_level:
            raise AppException(ERR_PERMISSION_DENIED, "用户等级不足", 403)
        return user
    return checker


async def get_user_role_codes(user: SysUser) -> list[str]:
    if hasattr(user, "_role_codes"):
        return user._role_codes
    from sqlalchemy import select as sa_select
    from app.models.role import SysRole
    from app.database import async_session
    async with async_session() as session:
        stmt = (
            sa_select(SysRole.role_code)
            .select_from(SysRole)
            .join(SysRole.users)
            .where(SysUser.id == user.id)
        )
        result = await session.execute(stmt)
        role_codes = list(result.scalars().all())
    user._role_codes = role_codes
    return role_codes
