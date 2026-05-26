import json

from langchain_core.tools import tool
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import LEVEL_CONFIG, POST_STATUS_PUBLISHED
from app.models.category import ForumCategory
from app.models.post import ForumPost
from app.models.user import SysUser


def create_search_forum_posts(db: AsyncSession):
    @tool
    async def search_forum_posts(query: str, category_id: int = 0, limit: int = 10) -> str:
        """搜索论坛帖子，支持关键词模糊匹配。返回匹配的帖子列表及摘要信息。

        Args:
            query: 搜索关键词
            category_id: 可选的版块 ID，0 表示不限定版块
            limit: 返回结果数量上限，默认 10
        """
        conditions = [
            ForumPost.deleted == 0,
            ForumPost.status == POST_STATUS_PUBLISHED,
            or_(
                ForumPost.title.ilike(f"%{query}%"),
                ForumPost.content.ilike(f"%{query}%"),
                ForumPost.summary.ilike(f"%{query}%"),
            ),
        ]
        if category_id and category_id > 0:
            conditions.append(ForumPost.category_id == category_id)

        stmt = (
            select(ForumPost)
            .where(*conditions)
            .order_by(ForumPost.sort_weight.desc())
            .limit(limit)
        )
        result = await db.execute(stmt)
        posts = result.scalars().all()

        items = []
        for p in posts:
            items.append({
                "postId": p.id,
                "title": p.title,
                "summary": p.summary[:200] if p.summary else p.content[:200],
                "authorName": p.author.nickname if p.author else "未知",
                "likeCount": p.like_count,
                "commentCount": p.comment_count,
            })

        if not items:
            return "未找到与关键词相关的帖子。"
        return json.dumps(items, ensure_ascii=False)

    return search_forum_posts


def create_read_post_content(db: AsyncSession):
    @tool
    async def read_post_content(post_id: int) -> str:
        """读取指定帖子的完整内容。返回帖子的标题、作者、正文和标签信息。

        Args:
            post_id: 帖子 ID
        """
        stmt = select(ForumPost).where(
            ForumPost.id == post_id,
            ForumPost.deleted == 0,
            ForumPost.status == POST_STATUS_PUBLISHED,
        )
        result = await db.execute(stmt)
        post = result.scalar_one_or_none()

        if post is None:
            return json.dumps({"error": "帖子不存在或已被删除"}, ensure_ascii=False)

        return json.dumps({
            "postId": post.id,
            "title": post.title,
            "authorName": post.author.nickname if post.author else "未知",
            "content": post.content,
            "summary": post.summary,
            "tags": post.tag_list,
            "likeCount": post.like_count,
            "commentCount": post.comment_count,
            "viewCount": post.view_count,
        }, ensure_ascii=False)

    return read_post_content


def create_get_category_info(db: AsyncSession):
    @tool
    async def get_category_info(category_id: int) -> str:
        """获取指定版块的详细信息，包括版块名称、描述和 AI 人设。

        Args:
            category_id: 版块 ID
        """
        cat = await db.get(ForumCategory, category_id)
        if cat is None or cat.deleted:
            return json.dumps({"error": "版块不存在"}, ensure_ascii=False)

        return json.dumps({
            "id": cat.id,
            "name": cat.name,
            "description": cat.description,
            "aiPersona": cat.ai_persona,
            "postCount": cat.post_count,
        }, ensure_ascii=False)

    return get_category_info


def build_user_context(user: SysUser) -> dict:
    """构建当前用户的上下文信息"""
    cfg = LEVEL_CONFIG.get(user.level, LEVEL_CONFIG[1])
    profile = getattr(user, "profile", None)

    ctx = {
        "userId": user.id,
        "username": user.username,
        "nickname": user.nickname or user.username,
        "level": user.level,
        "levelName": cfg["name"],
    }

    if profile:
        ctx["bio"] = profile.bio or ""
        ctx["skillsTags"] = profile.skills_tags or []
        ctx["occupation"] = profile.occupation or ""

    return ctx
