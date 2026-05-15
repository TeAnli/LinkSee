from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import require_admin
from app.models.user import SysUser
from app.schemas.admin import (
    CategoryManageRequest,
    PostFeatureRequest,
    PostModerateRequest,
    RoleUpdateRequest,
    UserStatusRequest,
)
from app.services import admin_service
from app.utils import ok

router = APIRouter(prefix="/api/admin", tags=["管理后台"])


_admin_dep = Depends(require_admin())


@router.get("/dashboard")
async def dashboard(db: AsyncSession = Depends(get_db), user: SysUser = _admin_dep):
    data = await admin_service.get_dashboard(db)
    return ok(data)


@router.get("/users")
async def list_users(
    keyword: str | None = None,
    status: int | None = None,
    level: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = await admin_service.list_users_admin(db, keyword, status, level, page, size)
    return ok(data)


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    req: UserStatusRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    await admin_service.update_user_status(db, user_id, req.status, req.reason or "", req.muteUntil)
    return ok(None, "用户状态已更新")


@router.put("/users/{user_id}/roles")
async def update_user_roles(
    user_id: int,
    req: RoleUpdateRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    await admin_service.update_user_roles(db, user_id, req.roles)
    return ok(None, "角色已更新")


@router.get("/posts")
async def list_posts_admin(
    status: int | None = None,
    categoryId: int | None = None,
    keyword: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = await admin_service.list_posts_admin(db, status, categoryId, keyword, page, size)
    return ok(data)


@router.post("/posts/{post_id}/moderate")
async def moderate_post(
    post_id: int,
    req: PostModerateRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    await admin_service.moderate_post(db, post_id, req.action, req.reason)
    return ok(None, "审核操作已完成")


@router.put("/posts/{post_id}/feature")
async def set_feature(
    post_id: int,
    req: PostFeatureRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    await admin_service.set_feature(db, post_id, req.model_dump(exclude_none=True))
    return ok(None, "特性设置已更新")


@router.get("/categories")
async def list_categories(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = await admin_service.list_categories_admin(db, page, size)
    return ok(data)


@router.post("/categories")
async def create_category(
    req: CategoryManageRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = req.model_dump(exclude_none=True)
    if data.get("postTemplate"):
        data["post_template"] = data.pop("postTemplate")
    if data.get("parentId") is not None:
        data["parent_id"] = data.pop("parentId")
    if data.get("sortOrder") is not None:
        data["sort_order"] = data.pop("sortOrder")
    if data.get("themeColor"):
        data["theme_color"] = data.pop("themeColor")
    if data.get("aiPersona"):
        data["ai_persona"] = data.pop("aiPersona")
    await admin_service.manage_category(db, data)
    return ok(None, "板块已创建")


@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    req: CategoryManageRequest,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = req.model_dump(exclude_none=True)
    if data.get("postTemplate"):
        data["post_template"] = data.pop("postTemplate")
    if data.get("parentId") is not None:
        data["parent_id"] = data.pop("parentId")
    if data.get("sortOrder") is not None:
        data["sort_order"] = data.pop("sortOrder")
    if data.get("themeColor"):
        data["theme_color"] = data.pop("themeColor")
    if data.get("aiPersona"):
        data["ai_persona"] = data.pop("aiPersona")
    await admin_service.manage_category(db, data, category_id)
    return ok(None, "板块已更新")


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    await admin_service.delete_category(db, category_id)
    return ok(None, "板块已删除")


@router.get("/ai/usage/stats")
async def ai_usage_stats(
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = await admin_service.ai_usage_stats(db)
    return ok(data)


@router.get("/ai/tasks")
async def ai_task_logs(
    userId: int | None = None,
    taskType: str | None = None,
    status: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    user: SysUser = _admin_dep,
):
    data = await admin_service.ai_task_logs(db, userId, taskType, status, page, size)
    return ok(data)
