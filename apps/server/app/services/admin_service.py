import datetime

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import POST_STATUS_REVIEWING, POST_STATUS_VIOLATION
from app.models.category import ForumCategory
from app.models.comment import ForumComment
from app.models.post import ForumPost
from app.models.user import SysUser


async def get_dashboard(db: AsyncSession) -> dict:
    from app.models.ai_moderation import AiModerationLog
    from app.models.ai_task import AiTaskRecord

    today = datetime.date.today()
    today_start = datetime.datetime.combine(today, datetime.time.min, tzinfo=datetime.timezone.utc)
    seven_days_ago = today_start - datetime.timedelta(days=7)

    total_users = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0))).scalar()
    new_users_today = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0, SysUser.created_at >= today_start))).scalar()
    total_posts = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.deleted == 0))).scalar()
    new_posts_today = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.deleted == 0, ForumPost.created_at >= today_start))).scalar()
    total_comments = (await db.execute(select(func.count(ForumComment.id)).where(ForumComment.deleted == 0))).scalar()
    new_comments_today = (await db.execute(select(func.count(ForumComment.id)).where(ForumComment.deleted == 0, ForumComment.created_at >= today_start))).scalar()
    active_users_7d = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0, SysUser.last_login_at >= seven_days_ago))).scalar()
    ai_calls_today = (await db.execute(select(func.count(AiTaskRecord.id)).where(AiTaskRecord.created_at >= today_start))).scalar()

    # Trend: last 7 days
    trend_posts = []
    trend_users = []
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        ds = datetime.datetime.combine(d, datetime.time.min, tzinfo=datetime.timezone.utc)
        de = datetime.datetime.combine(d + datetime.timedelta(days=1), datetime.time.min, tzinfo=datetime.timezone.utc)
        pc = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.deleted == 0, ForumPost.created_at >= ds, ForumPost.created_at < de))).scalar()
        uc = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0, SysUser.created_at >= ds, SysUser.created_at < de))).scalar()
        trend_posts.append({"date": d.isoformat(), "count": pc})
        trend_users.append({"date": d.isoformat(), "count": uc})

    pending_review = (await db.execute(
        select(func.count(ForumPost.id)).where(
            ForumPost.deleted == 0, ForumPost.status == POST_STATUS_REVIEWING
        )
    )).scalar()

    # Hot posts: top 5 by view count (published only)
    hot_posts_stmt = (
        select(ForumPost)
        .where(ForumPost.deleted == 0)
        .order_by(ForumPost.view_count.desc())
        .limit(5)
    )
    hot_posts_result = await db.execute(hot_posts_stmt)
    hot_posts_list = []
    for p in hot_posts_result.scalars().all():
        author = await db.get(SysUser, p.author_id)
        hot_posts_list.append({
            "id": p.id,
            "title": p.title,
            "authorNickname": author.nickname if author else "",
            "viewCount": p.view_count,
        })

    # Recent moderations: last 5
    mod_stmt = (
        select(AiModerationLog)
        .order_by(AiModerationLog.created_at.desc())
        .limit(5)
    )
    mod_result = await db.execute(mod_stmt)
    recent_mods = []
    for m in mod_result.scalars().all():
        post = await db.get(ForumPost, m.content_id) if m.content_type == "post" else None
        recent_mods.append({
            "id": m.id,
            "postId": m.content_id,
            "postTitle": post.title if post else "",
            "action": m.action,
            "reason": m.violation_type or "",
            "operatorName": "系统",
            "createdAt": m.created_at.isoformat() if m.created_at else "",
        })

    return {
        "overview": {
            "totalUsers": total_users, "newUsersToday": new_users_today,
            "totalPosts": total_posts, "newPostsToday": new_posts_today,
            "totalComments": total_comments, "newCommentsToday": new_comments_today,
            "activeUsers7d": active_users_7d or 0, "aiCallsToday": ai_calls_today or 0,
            "pendingReviewPosts": pending_review or 0,
        },
        "trendPosts": trend_posts,
        "trendUsers": trend_users,
        "hotPosts": hot_posts_list,
        "recentModerations": recent_mods,
    }


async def list_users_admin(db: AsyncSession, keyword: str | None = None, status: int | None = None, level: int | None = None, page: int = 1, size: int = 20) -> dict:
    conditions = [SysUser.deleted == 0]
    if keyword:
        conditions.append(SysUser.username.ilike(f"%{keyword}%") | SysUser.nickname.ilike(f"%{keyword}%") | SysUser.email.ilike(f"%{keyword}%"))
    if status is not None:
        conditions.append(SysUser.status == status)
    if level is not None:
        conditions.append(SysUser.level == level)

    count_stmt = select(func.count(SysUser.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = select(SysUser).where(and_(*conditions)).order_by(SysUser.id.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    users = result.scalars().all()

    items = []
    for u in users:
        items.append({
            "id": u.id, "username": u.username, "nickname": u.nickname,
            "email": u.email, "level": u.level,
            "experience": u.experience, "status": u.status,
            "createdAt": u.created_at.isoformat() if u.created_at else None,
        })

    return {"total": total, "list": items}


async def update_user_status(db: AsyncSession, user_id: int, status: int, reason: str = "", mute_until: str | None = None):
    await db.execute(update(SysUser).where(SysUser.id == user_id).values(status=status))
    await db.flush()


async def update_user_roles(db: AsyncSession, user_id: int, role_codes: list[str]):
    from app.models.role import SysRole, sys_user_role
    user = await db.get(SysUser, user_id)
    if user:
        result = await db.execute(select(SysRole).where(SysRole.code.in_(role_codes)))
        roles = result.scalars().all()
        user.roles = list(roles)
        await db.flush()


async def list_posts_admin(db: AsyncSession, status: int | None = None, category_id: int | None = None, keyword: str | None = None, page: int = 1, size: int = 20) -> dict:
    conditions = [ForumPost.deleted == 0]
    if status is not None:
        conditions.append(ForumPost.status == status)
    if category_id:
        conditions.append(ForumPost.category_id == category_id)
    if keyword:
        conditions.append(ForumPost.title.ilike(f"%{keyword}%"))

    count_stmt = select(func.count(ForumPost.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = select(ForumPost).where(and_(*conditions)).order_by(ForumPost.id.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    posts = result.scalars().all()

    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        items.append({
            "id": p.id, "title": p.title, "authorId": p.author_id,
            "authorNickname": author.nickname if author else "",
            "status": p.status, "isTop": p.is_top, "isEssence": p.is_essence,
            "viewCount": p.view_count, "publishedAt": p.published_at.isoformat() if p.published_at else None,
        })

    return {"total": total, "list": items}


async def moderate_post(db: AsyncSession, post_id: int, action: str, reason: str = ""):
    """管理员审核帖子"""
    from app.services.moderation_service import manual_approve, manual_reject

    if action == "approve":
        await manual_approve(db, post_id, 0)
    elif action in ("reject", "violate"):
        await manual_reject(db, post_id, 0, reason)


async def list_reviewing_posts(db: AsyncSession, page: int = 1, size: int = 20) -> dict:
    """获取待审核帖子列表"""
    from app.models.ai_moderation import AiModerationLog

    conditions = [
        ForumPost.deleted == 0,
        ForumPost.status == POST_STATUS_REVIEWING,
    ]

    count_stmt = select(func.count(ForumPost.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = (
        select(ForumPost)
        .where(and_(*conditions))
        .order_by(ForumPost.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(stmt)
    posts = result.scalars().all()

    items = []
    for p in posts:
        author = await db.get(SysUser, p.author_id)
        # 获取最近的审核日志
        mod_log = await db.execute(
            select(AiModerationLog)
            .where(AiModerationLog.content_id == p.id, AiModerationLog.content_type == "post")
            .order_by(AiModerationLog.created_at.desc())
            .limit(1)
        )
        mod_log = mod_log.scalar()

        items.append({
            "id": p.id,
            "title": p.title,
            "content": p.content[:200] if p.content else "",
            "authorId": p.author_id,
            "authorNickname": author.nickname if author else "",
            "categoryId": p.category_id,
            "status": p.status,
            "createdAt": p.created_at.isoformat() if p.created_at else None,
            "moderationLog": {
                "confidence": mod_log.confidence if mod_log else None,
                "violationType": mod_log.violation_type if mod_log else "",
                "action": mod_log.action if mod_log else "",
            } if mod_log else None,
        })

    return {"total": total, "list": items}


async def get_moderation_logs(db: AsyncSession, post_id: int) -> list[dict]:
    """获取帖子的审核日志"""
    from app.models.ai_moderation import AiModerationLog

    stmt = (
        select(AiModerationLog)
        .where(AiModerationLog.content_id == post_id, AiModerationLog.content_type == "post")
        .order_by(AiModerationLog.created_at.desc())
    )
    result = await db.execute(stmt)
    logs = result.scalars().all()

    return [{
        "id": l.id,
        "result": l.result,
        "violationType": l.violation_type,
        "confidence": l.confidence,
        "action": l.action,
        "createdAt": l.created_at.isoformat() if l.created_at else None,
    } for l in logs]


async def set_feature(db: AsyncSession, post_id: int, req: dict):
    post = await db.get(ForumPost, post_id)
    if post:
        if "isTop" in req:
            post.is_top = req["isTop"]
        if "isEssence" in req:
            post.is_essence = req["isEssence"]
        await db.flush()


async def list_categories_admin(db: AsyncSession, page: int = 1, size: int = 20) -> dict:
    conditions = [ForumCategory.deleted == 0]
    count_stmt = select(func.count(ForumCategory.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = (
        select(ForumCategory)
        .where(and_(*conditions))
        .order_by(ForumCategory.sort_order.asc(), ForumCategory.id.asc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(stmt)
    cats = result.scalars().all()

    items = []
    for c in cats:
        items.append({
            "id": c.id, "name": c.name, "icon": c.icon,
            "parentId": c.parent_id, "description": c.description or "",
            "sortOrder": c.sort_order, "themeColor": c.theme_color,
            "postTemplate": c.post_template, "aiPersona": c.ai_persona,
            "status": c.status,
        })

    return {"total": total, "list": items}


async def manage_category(db: AsyncSession, data: dict, category_id: int | None = None):
    if category_id:
        cat = await db.get(ForumCategory, category_id)
        if cat:
            for k, v in data.items():
                setattr(cat, k, v)
            await db.flush()
        return cat
    else:
        cat = ForumCategory(**data)
        db.add(cat)
        await db.flush()
        return cat


async def delete_category(db: AsyncSession, category_id: int):
    cat = await db.get(ForumCategory, category_id)
    if cat:
        cat.deleted = 1
        await db.flush()


async def ai_usage_stats(db: AsyncSession) -> dict:
    from app.models.ai_task import AiTaskRecord
    total = (await db.execute(select(func.count(AiTaskRecord.id)))).scalar()
    breakdown = []

    # By task type
    task_types = await db.execute(
        select(AiTaskRecord.task_type, func.count(AiTaskRecord.id), func.avg(AiTaskRecord.tokens_input + AiTaskRecord.tokens_output))
        .group_by(AiTaskRecord.task_type)
    )
    for tt, cnt, avg_tok in task_types:
        breakdown.append({"groupBy": tt, "calls": cnt, "avgTokens": round(float(avg_tok or 0), 2)})

    return {
        "totalCalls": total, "totalTokensInput": 0, "totalTokensOutput": 0,
        "costEstimate": 0.0, "avgResponseTimeMs": 0,
        "breakdown": breakdown,
    }


async def ai_task_logs(db: AsyncSession, user_id: int | None = None, task_type: str | None = None, status: int | None = None, page: int = 1, size: int = 20) -> dict:
    from app.models.ai_task import AiTaskRecord
    conditions = []
    if user_id:
        conditions.append(AiTaskRecord.user_id == user_id)
    if task_type:
        conditions.append(AiTaskRecord.task_type == task_type)
    if status is not None:
        conditions.append(AiTaskRecord.status == status)

    count_args = [AiTaskRecord] + ([[and_(*conditions)]] if conditions else [])
    total = 0
    if conditions:
        total = (await db.execute(select(func.count(AiTaskRecord.id)).where(and_(*conditions)))).scalar()
    else:
        total = (await db.execute(select(func.count(AiTaskRecord.id)))).scalar()

    stmt = select(AiTaskRecord)
    if conditions:
        stmt = stmt.where(and_(*conditions))
    stmt = stmt.order_by(AiTaskRecord.id.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    tasks = result.scalars().all()

    items = []
    for t in tasks:
        items.append({
            "id": t.id, "userId": t.user_id, "taskType": t.task_type,
            "inputSummary": t.input_summary, "modelUsed": t.model_used,
            "tokensInput": t.tokens_input, "tokensOutput": t.tokens_output,
            "responseMs": t.response_ms, "status": t.status,
            "createdAt": t.created_at.isoformat() if t.created_at else None,
        })

    return {"total": total, "tasks": items}


# ---- 敏感词管理 ----


def list_sensitive_words(keyword: str | None = None, page: int = 1, size: int = 100) -> dict:
    """分页获取敏感词列表"""
    from app.services.sensitive_word import get_all_words

    all_data = get_all_words()

    # 展平为列表
    flat: list[dict] = []
    for cat, words in all_data.items():
        for w in words:
            if keyword and keyword not in w:
                continue
            flat.append({"category": cat, "word": w})

    flat.sort(key=lambda x: (x["category"], x["word"]))
    total = len(flat)
    start = (page - 1) * size
    return {"total": total, "list": flat[start:start + size]}


def add_sensitive_words(category: str, words: list[str]) -> dict:
    """批量添加敏感词"""
    from app.services.sensitive_word import add_words

    count = add_words(category, words)
    return {"added": count, "category": category}


def delete_sensitive_word(category: str, word: str) -> bool:
    """删除单个敏感词"""
    from app.services.sensitive_word import remove_word

    return remove_word(category, word)


# ---- 评论管理 ----


async def list_comments_admin(db: AsyncSession, keyword: str | None = None, page: int = 1, size: int = 20) -> dict:
    conditions = [ForumComment.deleted == 0]
    if keyword:
        conditions.append(ForumComment.content.ilike(f"%{keyword}%"))

    count_stmt = select(func.count(ForumComment.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = (
        select(ForumComment)
        .where(and_(*conditions))
        .order_by(ForumComment.id.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(stmt)
    comments = result.scalars().all()

    items = []
    for c in comments:
        author = await db.get(SysUser, c.user_id)
        post = await db.get(ForumPost, c.post_id)
        items.append({
            "id": c.id,
            "content": c.content,
            "postId": c.post_id,
            "postTitle": post.title if post else "",
            "userId": c.user_id,
            "authorNickname": author.nickname or author.username if author else "",
            "createdAt": c.created_at.isoformat() if c.created_at else None,
        })

    return {"total": total, "list": items}


async def delete_comment_admin(db: AsyncSession, comment_id: int) -> None:
    comment = await db.get(ForumComment, comment_id)
    if not comment or comment.deleted:
        from app.exceptions import AppException
        from app.constants import ERR_POST_NOT_FOUND
        raise AppException(ERR_POST_NOT_FOUND, "评论不存在", 404)
    comment.deleted = 1
    await db.flush()


def get_sensitive_words_raw() -> str:
    """获取敏感词 JSON 原始文本"""
    from app.services.sensitive_word import get_raw_json

    return get_raw_json()


def save_sensitive_words_raw(raw: str) -> None:
    """保存敏感词 JSON 原始文本"""
    from app.services.sensitive_word import save_raw_json

    save_raw_json(raw)
