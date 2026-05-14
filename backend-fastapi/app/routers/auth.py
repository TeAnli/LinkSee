from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import SysUser
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    SendEmailCodeRequest,
)
from app.crypto import get_public_key_pem
from app.services import auth_service
from app.utils import ok

router = APIRouter(prefix="/api/auth", tags=["认证"])


@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    data = await auth_service.register(db, req)
    return ok(data, "注册成功")


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    data = await auth_service.login(db, req)
    return ok(data, "登录成功")


@router.post("/logout")
async def logout(user: SysUser = Depends(get_current_user)):
    return ok(None, "登出成功")


@router.post("/refresh-token")
async def refresh_token(req: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    data = await auth_service.refresh_token(db, req)
    return ok(data, "token刷新成功")


@router.post("/send-email-code")
async def send_email_code(req: SendEmailCodeRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.send_email_code(db, req)
    return ok(None, "验证码已发送")


@router.get("/captcha")
async def get_captcha():
    data = auth_service.generate_captcha()
    return ok(data)


@router.post("/reset-password")
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    await auth_service.reset_password(db, req)
    return ok(None, "密码重置成功")


@router.get("/public-key")
async def public_key():
    return ok({"publicKey": get_public_key_pem()})
