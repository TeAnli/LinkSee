import re

from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import POST_STATUS_PUBLISHED
from app.models.category import ForumCategory
from app.models.post import ForumPost
from app.models.user import SysUser


_HOT_KEYWORDS_CACHE: list[dict] = []


async def search(db: AsyncSession, q: str, category_id: int | None = None, tag: str | None = None, sort: str = "relevance", page: int = 1, size: int = 20) -> dict:
    conditions = [
        ForumPost.deleted == 0,
        ForumPost.status == POST_STATUS_PUBLISHED,
        or_(ForumPost.title.ilike(f"%{q}%"), ForumPost.content.ilike(f"%{q}%"), ForumPost.summary.ilike(f"%{q}%")),
    ]
    if category_id:
        conditions.append(ForumPost.category_id == category_id)
    if tag:
        conditions.append(ForumPost.tag_list.contains([tag]))

    count_stmt = select(func.count(ForumPost.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    order_map = {
        "relevance": ForumPost.sort_weight.desc(),
        "latest": ForumPost.published_at.desc(),
        "hot": ForumPost.view_count.desc(),
    }
    order = order_map.get(sort, ForumPost.sort_weight.desc())

    stmt = select(ForumPost).where(and_(*conditions)).order_by(order).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    posts = result.scalars().all()

    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        cat = await db.get(ForumCategory, p.category_id)
        score = p.sort_weight

        def _highlight(text: str) -> str:
            if not text or not q:
                return text or ""
            return re.sub(re.escape(q), f"<em>{q}</em>", text, flags=re.IGNORECASE)

        items.append({
            "id": p.id, "title": p.title, "summary": p.summary,
            "tagList": p.tag_list or [], "categoryId": p.category_id,
            "categoryName": cat.name if cat else "",
            "author": {"id": author.id, "nickname": author.nickname or author.username, "avatarUrl": author.avatar_url} if author else None,
            "viewCount": p.view_count, "likeCount": p.like_count, "commentCount": p.comment_count,
            "publishedAt": p.published_at.isoformat() if p.published_at else None,
            "highlight": {"title": _highlight(p.title), "summary": _highlight(p.summary)},
            "score": score,
        })

    return {"total": total, "page": page, "size": size, "hasMore": (page * size) < total, "keyword": q, "list": items}


async def hot_keywords() -> dict:
    if _HOT_KEYWORDS_CACHE:
        return {"hotKeywords": _HOT_KEYWORDS_CACHE[:20]}
    return {"hotKeywords": [
        {"keyword": "Spring Boot 4.0", "heat": 8500},
        {"keyword": "GLM-4 API", "heat": 6200},
        {"keyword": "Kotlin 协程", "heat": 5100},
        {"keyword": "Vue3 最佳实践", "heat": 4800},
        {"keyword": "Milvus 入门", "heat": 3200},
    ]}


async def suggest(db: AsyncSession, q: str) -> dict:
    if len(q) < 2:
        return {"suggestions": []}

    stmt = (
        select(ForumPost.title)
        .where(ForumPost.deleted == 0, ForumPost.status == POST_STATUS_PUBLISHED, ForumPost.title.ilike(f"%{q}%"))
        .order_by(ForumPost.sort_weight.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    titles = result.scalars().all()
    return {"suggestions": list(titles)[:10]}
