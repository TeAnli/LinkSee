import datetime

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import POST_STATUS_REVIEWING, POST_STATUS_VIOLATION
from app.models.category import ForumCategory
from app.models.comment import ForumComment
from app.models.post import ForumPost
from app.models.user import SysUser


async def get_dashboard(db: AsyncSession) -> dict:
    today = datetime.date.today()
    today_start = datetime.datetime.combine(today, datetime.time.min, tzinfo=datetime.timezone.utc)

    total_users = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0))).scalar()
    new_users_today = (await db.execute(select(func.count(SysUser.id)).where(SysUser.deleted == 0, SysUser.created_at >= today_start))).scalar()
    total_posts = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.deleted == 0))).scalar()
    new_posts_today = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.deleted == 0, ForumPost.created_at >= today_start))).scalar()
    total_comments = (await db.execute(select(func.count(ForumComment.id)).where(ForumComment.deleted == 0))).scalar()
    new_comments_today = (await db.execute(select(func.count(ForumComment.id)).where(ForumComment.deleted == 0, ForumComment.created_at >= today_start))).scalar()

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

    return {
        "overview": {
            "totalUsers": total_users, "newUsersToday": new_users_today,
            "totalPosts": total_posts, "newPostsToday": new_posts_today,
            "totalComments": total_comments, "newCommentsToday": new_comments_today,
            "activeUsers7d": 0, "aiCallsToday": 0,
        },
        "trendPosts": trend_posts,
        "trendUsers": trend_users,
        "hotPosts": [],
        "recentModerations": [],
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
            "email": u.email, "phone": u.phone, "level": u.level,
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
        result = await db.execute(select(SysRole).where(SysRole.role_code.in_(role_codes)))
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
    post = await db.get(ForumPost, post_id)
    if post:
        if action == "approve":
            post.status = 1
        elif action == "reject":
            post.status = 0
        elif action == "violate":
            post.status = POST_STATUS_VIOLATION
        await db.flush()


async def set_feature(db: AsyncSession, post_id: int, req: dict):
    post = await db.get(ForumPost, post_id)
    if post:
        if "isTop" in req:
            post.is_top = req["isTop"]
        if "isEssence" in req:
            post.is_essence = req["isEssence"]
        await db.flush()


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
