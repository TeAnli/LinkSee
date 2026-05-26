from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user, get_current_user_optional
from app.models.user import SysUser
from app.schemas.forum import CommentCreateRequest, CommentUpdateRequest, PostCreateRequest, PostUpdateRequest
from app.services import forum_service
from app.utils import ok

router = APIRouter(prefix="/api/forum", tags=["论坛"])


# === Categories ===
@router.get("/categories")
async def get_categories(includeStats: bool = False, db: AsyncSession = Depends(get_db)):
    data = await forum_service.get_categories(db, includeStats)
    return ok(data)


@router.get("/category/{category_id}")
async def get_category_detail(category_id: int, db: AsyncSession = Depends(get_db)):
    data = await forum_service.get_category_detail(db, category_id)
    return ok(data)


# === Posts ===
@router.post("/post")
async def create_post(req: PostCreateRequest, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await forum_service.create_post(db, user.id, req)
    return ok(data, "发布成功")


@router.get("/post/{post_id}")
async def get_post_detail(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    user: SysUser | None = Depends(get_current_user_optional),
):
    viewer_id = user.id if user else None
    data = await forum_service.get_post_detail(db, post_id, viewer_id)
    return ok(data)


@router.put("/post/{post_id}")
async def update_post(
    post_id: int,
    req: PostUpdateRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await forum_service.update_post(db, post_id, user.id, req)
    return ok(data, "编辑成功")


@router.delete("/post/{post_id}")
async def delete_post(post_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await forum_service.delete_post(db, post_id, user.id)
    return ok(None, "删除成功")


@router.get("/posts")
async def list_posts(
    categoryId: int | None = None,
    sort: str = "hot",
    tag: str | None = None,
    keyword: str | None = None,
    authorId: int | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    data = await forum_service.list_posts(db, categoryId, sort, tag, keyword, authorId, page, size)
    return ok(data)


# === Comments ===
@router.post("/post/{post_id}/comment")
async def create_comment(
    post_id: int,
    req: CommentCreateRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await forum_service.create_comment(db, post_id, user.id, req.content, req.parentId, req.replyUserId)
    return ok(data, "评论成功")


@router.get("/post/{post_id}/comments")
async def list_comments(
    post_id: int,
    sortBy: str = "latest",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    rootOnly: bool = False,
    db: AsyncSession = Depends(get_db),
    user: SysUser | None = Depends(get_current_user_optional),
):
    viewer_id = user.id if user else None
    data = await forum_service.list_comments(db, post_id, sortBy, page, size, rootOnly, viewer_id)
    return ok(data)


@router.delete("/comment/{comment_id}")
async def delete_comment(comment_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await forum_service.delete_comment(db, comment_id, user.id)
    return ok(None, "评论已删除")


@router.put("/comment/{comment_id}")
async def update_comment(
    comment_id: int,
    req: CommentUpdateRequest,
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await forum_service.update_comment(db, comment_id, user.id, req.content)
    return ok(data, "评论已更新")


# === Interactions ===
@router.post("/post/{post_id}/like")
async def toggle_like(post_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await forum_service.toggle_like(db, user.id, post_id)
    return ok(data)


@router.post("/post/{post_id}/collect")
async def toggle_collect(post_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await forum_service.toggle_collect(db, user.id, post_id)
    return ok(data)


@router.post("/user/{user_id}/follow")
async def toggle_follow(user_id: int, user: SysUser = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    data = await forum_service.toggle_follow(db, user.id, user_id)
    return ok(data)


@router.get("/user/favorites")
async def get_favorites(
    sortBy: str = "latest",
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: SysUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await forum_service.get_favorites(db, user.id, sortBy, page, size)
    return ok(data)
