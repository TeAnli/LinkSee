import base64
import io
import random
import string
import time

from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import (
    ERR_ACCOUNT_DISABLED,
    ERR_ACCOUNT_LOCKED,
    ERR_CAPTCHA_INVALID,
    ERR_CAPTCHA_WRONG,
    ERR_EMAIL_EXISTS,
    ERR_PASSWORD_WRONG,
    ERR_PHONE_EXISTS,
    ERR_REFRESH_EXPIRED,
    ERR_REFRESH_INVALID,
    ERR_USERNAME_EXISTS,
    ERR_USER_NOT_FOUND,
    ROLE_USER,
)
from app.exceptions import AppException
from app.models.role import SysRole
from app.models.user import SysUser
from app.models.user_profile import SysUserProfile
from app.schemas.auth import (
    CaptchaData,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
)
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

# In-memory captcha store: captcha_id -> (answer, expiry_timestamp)
_captcha_store: dict[str, tuple[str, float]] = {}

LOGIN_FAILURES: dict[str, tuple[int, float]] = {}

MAX_LOGIN_FAILURES = 5
LOGIN_LOCK_SECONDS = 900

FONT = ImageFont.truetype("arial.ttf", 42)


def _cleanup_expired():
    now = time.time()
    expired = [k for k, v in _captcha_store.items() if v[1] < now]
    for k in expired:
        del _captcha_store[k]
    expired_l = [
        k for k, v in LOGIN_FAILURES.items() if v[1] + LOGIN_LOCK_SECONDS < now
    ]
    for k in expired_l:
        del LOGIN_FAILURES[k]


def generate_captcha() -> CaptchaData:
    _cleanup_expired()
    chars = string.ascii_uppercase + string.digits
    answer = "".join(random.choices(chars, k=4))
    captcha_id = "cap_" + "".join(
        random.choices(string.ascii_lowercase + string.digits, k=12)
    )

    W, H = 280, 100
    img = Image.new("RGB", (W, H), color=(240, 240, 245))
    draw = ImageDraw.Draw(img)
    for i, ch in enumerate(answer):
        x = 30 + i * 62 + random.randint(-6, 6)
        y = random.randint(12, 28)
        draw.text(
            (x, y),
            ch,
            font=FONT,
            fill=(
                random.randint(20, 120),
                random.randint(20, 120),
                random.randint(20, 180),
            ),
        )
    for _ in range(80):
        x = random.randint(0, W - 1)
        y = random.randint(0, H - 1)
        r = random.randint(1, 3)
        color = (
            random.randint(100, 200),
            random.randint(100, 200),
            random.randint(100, 200),
        )
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)
    for _ in range(4):
        x1 = random.randint(0, W - 1)
        y1 = random.randint(0, H - 1)
        x2 = x1 + random.randint(-70, 70)
        y2 = y1 + random.randint(-40, 40)
        draw.line((x1, y1, x2, y2), fill=(160, 160, 180), width=2)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()
    _captcha_store[captcha_id] = (answer, time.time() + 300)
    return CaptchaData(
        captchaId=captcha_id, captchaImageBase64=f"data:image/png;base64,{b64}"
    )


def _verify_captcha(captcha_id: str, captcha_value: str) -> bool:
    _cleanup_expired()
    entry = _captcha_store.get(captcha_id)
    if not entry:
        return False
    answer, _ = entry
    del _captcha_store[captcha_id]
    return answer.upper() == captcha_value.upper()


async def register(db: AsyncSession, req: RegisterRequest) -> dict:
    if not _verify_captcha(req.captchaId, req.captchaValue):
        raise AppException(ERR_CAPTCHA_INVALID, "验证码错误或过期")

    existing = await db.execute(select(SysUser).where(SysUser.username == req.username))
    if existing.scalar():
        raise AppException(ERR_USERNAME_EXISTS, "用户名已存在", 409)

    if req.email:
        existing = await db.execute(select(SysUser).where(SysUser.email == req.email))
        if existing.scalar():
            raise AppException(ERR_EMAIL_EXISTS, "邮箱已注册", 409)

    if req.phone:
        existing = await db.execute(select(SysUser).where(SysUser.phone == req.phone))
        if existing.scalar():
            raise AppException(ERR_PHONE_EXISTS, "手机号已注册", 409)

    role_user = await db.execute(select(SysRole).where(SysRole.role_code == ROLE_USER))
    role_user = role_user.scalar()

    user = SysUser(
        username=req.username,
        password_hash=hash_password(req.password),
        nickname=req.username,
        email=req.email or "",
        phone=req.phone or "",
    )
    if role_user:
        user.roles = [role_user]
    db.add(user)
    await db.flush()

    profile = SysUserProfile(user_id=user.id)
    db.add(profile)
    await db.flush()

    access_token = create_access_token(user.id, [ROLE_USER])
    refresh_token = create_refresh_token(user.id)

    return {
        "userId": user.id,
        "token": access_token,
        "refreshToken": refresh_token,
        "expiresIn": settings.jwt_expiration_seconds,
    }


async def login(db: AsyncSession, req: LoginRequest) -> dict:
    _cleanup_expired()

    key = f"login:{req.username}"
    failures, lock_until = LOGIN_FAILURES.get(key, (0, 0))
    if failures >= MAX_LOGIN_FAILURES and time.time() < lock_until:
        remaining = int(lock_until - time.time())
        raise AppException(
            ERR_ACCOUNT_LOCKED, f"账号已锁定，请{remaining // 60}分钟后再试", 429
        )

    if failures >= MAX_LOGIN_FAILURES and req.captchaId:
        if not _verify_captcha(req.captchaId, req.captchaValue):
            raise AppException(ERR_CAPTCHA_WRONG, "验证码错误")

    user = await db.execute(
        select(SysUser).where(
            (SysUser.username == req.username)
            | (SysUser.email == req.username)
            | (SysUser.phone == req.username)
        )
    )
    user = user.scalar()
    if not user:
        raise AppException(ERR_USER_NOT_FOUND, "用户不存在", 401)

    if not verify_password(req.password, user.password_hash):
        failures += 1
        lock_until = (
            time.time() + LOGIN_LOCK_SECONDS if failures >= MAX_LOGIN_FAILURES else 0
        )
        LOGIN_FAILURES[key] = (failures, lock_until)
        raise AppException(ERR_PASSWORD_WRONG, "密码错误", 401)

    if user.status == 0:
        raise AppException(ERR_ACCOUNT_DISABLED, "账号已被禁用", 403)

    LOGIN_FAILURES.pop(key, None)

    user_role_result = await db.execute(
        select(SysRole.role_code)
        .select_from(SysRole)
        .join(SysRole.users)
        .where(SysUser.id == user.id)
    )
    roles = list(user_role_result.scalars().all())

    access_token = create_access_token(user.id, roles)
    refresh_token = create_refresh_token(user.id)

    return {
        "userId": user.id,
        "token": access_token,
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


async def refresh_token(db: AsyncSession, req: RefreshTokenRequest) -> dict:
    try:
        payload = decode_token(req.refreshToken)
    except Exception:
        raise AppException(ERR_REFRESH_INVALID, "refreshToken无效", 401)

    if payload.get("type") != "refresh":
        raise AppException(ERR_REFRESH_INVALID, "refreshToken类型错误", 401)

    user_id = int(payload["sub"])
    user = await db.get(SysUser, user_id)
    if not user or user.deleted:
        raise AppException(ERR_REFRESH_EXPIRED, "用户不存在", 401)

    user_role_result = await db.execute(
        select(SysRole.role_code)
        .select_from(SysRole)
        .join(SysRole.users)
        .where(SysUser.id == user.id)
    )
    roles = list(user_role_result.scalars().all())

    access_token = create_access_token(user.id, roles)
    new_refresh_token = create_refresh_token(user.id)

    return {
        "token": access_token,
        "refreshToken": new_refresh_token,
        "expiresIn": settings.jwt_expiration_seconds,
    }
