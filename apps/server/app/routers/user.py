import os
import time

from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import async_session, get_db
from app.dependencies import get_current_user, get_current_user_optional
from app.models.user import SysUser
from app.schemas.user import ProfileUpdateRequest
from app.services import user_service
from app.utils import ok

router = APIRouter(prefix="/api/user", tags=["用户"])


@router.get("/profile")
async def get_my_profile(user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await user_service.get_profile(db, user.id)
    return ok(data)


@router.put("/profile")
async def update_profile(req: ProfileUpdateRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await user_service.update_profile(db, user.id, req.model_dump(exclude_none=True))
    return ok(None, "资料更新成功")


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), user: SysUser = Depends(get_current_user)):
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "png"
    filename = f"{user.id}_{int(time.time())}.{ext}"
    os.makedirs(settings.upload_dir, exist_ok=True)
    filepath = os.path.join(settings.upload_dir, filename)
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)
    avatar_url = f"/uploads/{filename}"
    async with async_session() as db:
        await db.execute(update(SysUser).where(SysUser.id == user.id).values(avatar_url=avatar_url))
        await db.commit()
    return ok({"avatarUrl": avatar_url}, "头像更新成功")


@router.get("/check-in")
async def check_in(user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await user_service.check_in(db, user.id)
    return ok(data, f"签到成功！连续签到 {data['consecutiveDays']} 天")


@router.get("/followers")
async def get_followers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.get_followers(db, user.id, page, size)
    return ok(data)


@router.get("/followings")
async def get_followings(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.get_followings(db, user.id, page, size)
    return ok(data)


@router.get("/rankings")
async def get_rankings(
    type: str = "experience",
    period: str = "all",
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.get_rankings(db, type, period, limit)
    return ok(data)


@router.get("/{user_id}/profile")
async def get_public_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: SysUser | None = Depends(get_current_user_optional),
):
    viewer_id = current_user.id if current_user else None
    data = await user_service.get_public_profile(db, user_id, viewer_id)
    return ok(data)


@router.get("/{user_id}/posts")
async def get_user_posts(
    user_id: int,
    status: str = "published",
    sort: str = "latest",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    data = await user_service.get_user_posts(db, user_id, status, sort, page, size)
    return ok(data)
