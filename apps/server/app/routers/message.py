from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import SysUser
from app.schemas.message import MarkAllReadRequest
from app.services import message_service
from app.utils import ok

router = APIRouter(prefix="/api/message", tags=["消息通知"])


@router.get("/notifications")
async def list_notifications(
    type: str = "all",
    readStatus: str = "all",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await message_service.list_notifications(db, user.id, type, readStatus, page, size)
    return ok(data)


@router.put("/{notice_id}/read")
async def mark_read(notice_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await message_service.mark_read(db, notice_id, user.id)
    return ok(None, "已标记已读")


@router.put("/read-all")
async def mark_all_read(req: MarkAllReadRequest | None = None, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    notice_type = req.type if req else None
    data = await message_service.mark_all_read(db, user.id, notice_type)
    return ok(data, "全部已读")


@router.get("/unread-count")
async def unread_count(user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await message_service.unread_count(db, user.id)
    return ok(data)
