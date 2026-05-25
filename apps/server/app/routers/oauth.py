from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import SysUser
from app.schemas.auth import OAuthLoginRequest
from app.services import oauth_service
from app.utils import ok

router = APIRouter(prefix="/api/auth/oauth", tags=["OAuth认证"])


@router.get("/providers")
async def get_providers():
    return ok(oauth_service.get_oauth_providers())


@router.get("/authorize/{provider}")
async def get_authorize_url(
    provider: str,
    redirectUri: str | None = Query(default=None, alias="redirectUri"),
):
    data = await oauth_service.get_authorize_url(provider, redirectUri)
    return ok(data)


@router.post("/login")
async def oauth_login(req: OAuthLoginRequest, db: AsyncSession = Depends(get_db)):
    data = await oauth_service.oauth_login(req.provider, req.code, req.state, db)
    return ok(data, "登录成功")


@router.get("/bind-status")
async def get_bind_status(
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await oauth_service.get_bind_status(user, db)
    return ok(data)


@router.post("/bind")
async def oauth_bind(
    req: OAuthLoginRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await oauth_service.oauth_bind(user, req.provider, req.code, req.state, db)
    return ok(None, "绑定成功")


@router.post("/unbind/{provider}")
async def oauth_unbind(
    provider: str,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await oauth_service.oauth_unbind(user, provider, db)
    return ok(None, "解绑成功")
