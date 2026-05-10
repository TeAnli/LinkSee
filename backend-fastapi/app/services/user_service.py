import datetime

from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.constants import (
    ERR_ALREADY_CHECKED_IN,
    ERR_USER_NOT_FOUND,
    LEVEL_CONFIG,
    POINTS_CHECK_IN_BASE,
)
from app.exceptions import AppException
from app.models.follow import ForumFollow
from app.models.post import ForumPost
from app.models.user import SysUser
from app.models.user_profile import SysUserProfile


def get_level_info(user: SysUser) -> dict:
    level = user.level
    cfg = LEVEL_CONFIG.get(level, LEVEL_CONFIG[1])
    next_cfg = LEVEL_CONFIG.get(level + 1, {"exp": cfg["exp"], "name": "顶峰"})
    current_lv_exp = cfg["exp"]
    next_lv_exp = next_cfg["exp"]
    if next_lv_exp == current_lv_exp:
        progress = 100.0
    else:
        progress = round((user.experience - current_lv_exp) / (next_lv_exp - current_lv_exp) * 100, 1)
    daily_total = cfg["daily_ai"]
    daily_remaining = 999 if daily_total == 0 else max(0, daily_total - user.daily_ai_calls)
    return {
        "currentLv": level,
        "currentLvName": cfg["name"],
        "currentLvExp": current_lv_exp,
        "nextLvExp": next_lv_exp,
        "progress": min(progress, 100.0),
        "nextLvName": next_cfg.get("name", "顶峰"),
        "todayAiCallsRemaining": daily_remaining,
        "todayAiCallsTotal": daily_total if daily_total > 0 else 999,
    }


async def get_profile(db: AsyncSession, user_id: int) -> dict:
    user = await db.get(SysUser, user_id)
    if not user:
        raise AppException(ERR_USER_NOT_FOUND, "用户不存在", 404)

    profile = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == user_id))
    profile = profile.scalar()

    level_info = get_level_info(user)

    email_masked = user.email
    if email_masked and "@" in email_masked:
        parts = email_masked.split("@")
        email_masked = parts[0][0] + "***" + parts[0][-1] + "@" + parts[1] if len(parts[0]) > 2 else parts[0][0] + "***@" + parts[1]

    phone_masked = user.phone
    if phone_masked and len(phone_masked) >= 7:
        phone_masked = phone_masked[:3] + "****" + phone_masked[-4:]

    return {
        "user": {
            "id": user.id, "username": user.username, "nickname": user.nickname or user.username,
            "avatarUrl": user.avatar_url, "email": email_masked, "phone": phone_masked,
            "level": user.level, "experience": user.experience, "status": user.status,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        },
        "profile": {
            "bio": profile.bio if profile else "", "location": profile.location if profile else "",
            "personalWebsite": profile.personal_website if profile else "",
            "socialLinks": profile.social_links if profile else {},
            "skillsTags": profile.skills_tags if profile else [],
            "education": profile.education if profile else "",
            "occupation": profile.occupation if profile else "",
            "isVerified": profile.is_verified if profile else False,
            "followerCount": profile.follower_count if profile else 0,
            "followingCount": profile.following_count if profile else 0,
        },
        "levelInfo": level_info,
    }


async def update_profile(db: AsyncSession, user_id: int, req: dict) -> dict:
    user_update = {}
    profile_update = {}

    for field in ["nickname"]:
        if req.get(field) is not None:
            user_update[field] = req[field]

    profile_fields = ["bio", "location", "personalWebsite", "socialLinks", "skillsTags", "education", "occupation"]
    for field in profile_fields:
        if req.get(field) is not None:
            key = {"personalWebsite": "personal_website", "socialLinks": "social_links", "skillsTags": "skills_tags"}.get(field, field)
            profile_update[key] = req[field]

    if user_update:
        await db.execute(update(SysUser).where(SysUser.id == user_id).values(**user_update))
    if profile_update:
        await db.execute(update(SysUserProfile).where(SysUserProfile.user_id == user_id).values(**profile_update))
    await db.flush()
    return {}


async def get_public_profile(db: AsyncSession, target_id: int, viewer_id: int | None = None) -> dict:
    user = await db.get(SysUser, target_id)
    if not user or user.deleted:
        raise AppException(ERR_USER_NOT_FOUND, "用户不存在", 404)

    profile = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == target_id))
    profile = profile.scalar()

    post_count = (await db.execute(select(func.count(ForumPost.id)).where(ForumPost.author_id == target_id, ForumPost.deleted == 0))).scalar()

    is_followed = False
    if viewer_id:
        follow = await db.execute(select(ForumFollow).where(ForumFollow.follower_id == viewer_id, ForumFollow.following_id == target_id))
        is_followed = follow.scalar() is not None

    return {
        "user": {
            "id": user.id, "nickname": user.nickname or user.username,
            "avatarUrl": user.avatar_url, "level": user.level,
            "bio": profile.bio if profile else "",
            "skillsTags": profile.skills_tags if profile else [],
            "occupation": profile.occupation if profile else "",
            "isVerified": profile.is_verified if profile else False,
            "followerCount": profile.follower_count if profile else 0,
            "followingCount": profile.following_count if profile else 0,
            "postCount": post_count,
            "likeReceivedCount": 0,
            "createdAt": user.created_at.isoformat() if user.created_at else None,
        },
        "isFollowed": is_followed,
    }


async def get_user_posts(db: AsyncSession, user_id: int, status: str = "published", sort: str = "latest", page: int = 1, size: int = 20) -> dict:
    from app.services.forum_service import list_posts
    return await list_posts(db, author_id=user_id, sort=sort, page=page, size=size)


async def get_followers(db: AsyncSession, user_id: int, page: int = 1, size: int = 20) -> dict:
    count_stmt = select(func.count(ForumFollow.id)).where(ForumFollow.following_id == user_id)
    total = (await db.execute(count_stmt)).scalar()

    stmt = (
        select(ForumFollow).where(ForumFollow.following_id == user_id)
        .order_by(ForumFollow.created_at.desc()).offset((page - 1) * size).limit(size)
    )
    result = await db.execute(stmt)
    follows = result.scalars().all()

    items = []
    for f in follows:
        follower = await db.get(SysUser, f.follower_id)
        fp = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == f.follower_id))
        fp = fp.scalar()
        # Check if viewer follows back
        back = await db.execute(select(ForumFollow).where(ForumFollow.follower_id == user_id, ForumFollow.following_id == f.follower_id))
        if follower:
            items.append({
                "userId": follower.id, "nickname": follower.nickname or follower.username,
                "avatarUrl": follower.avatar_url, "level": follower.level,
                "bio": fp.bio if fp else "",
                "isFollowed": back.scalar() is not None,
                "followedAt": f.created_at.isoformat() if f.created_at else None,
            })
    return {"total": total, "hasMore": (page * size) < total, "list": items}


async def get_followings(db: AsyncSession, user_id: int, page: int = 1, size: int = 20) -> dict:
    count_stmt = select(func.count(ForumFollow.id)).where(ForumFollow.follower_id == user_id)
    total = (await db.execute(count_stmt)).scalar()

    stmt = (
        select(ForumFollow).where(ForumFollow.follower_id == user_id)
        .order_by(ForumFollow.created_at.desc()).offset((page - 1) * size).limit(size)
    )
    result = await db.execute(stmt)
    follows = result.scalars().all()

    items = []
    for f in follows:
        following = await db.get(SysUser, f.following_id)
        fp = await db.execute(select(SysUserProfile).where(SysUserProfile.user_id == f.following_id))
        fp = fp.scalar()
        if following:
            items.append({
                "userId": following.id, "nickname": following.nickname or following.username,
                "avatarUrl": following.avatar_url, "level": following.level,
                "bio": fp.bio if fp else "",
                "isFollowed": True,
                "followedAt": f.created_at.isoformat() if f.created_at else None,
            })
    return {"total": total, "hasMore": (page * size) < total, "list": items}


async def get_rankings(db: AsyncSession, ranking_type: str = "experience", period: str = "all", limit: int = 50) -> dict:
    order_col = SysUser.experience.desc()
    if ranking_type == "posts":
        sub = select(func.count(ForumPost.id)).where(ForumPost.author_id == SysUser.id, ForumPost.deleted == 0)
        order_col = sub.desc()
    elif ranking_type == "likes":
        order_col = SysUser.experience.desc()

    stmt = select(SysUser).where(SysUser.deleted == 0, SysUser.status == 1).order_by(order_col).limit(limit)
    result = await db.execute(stmt)
    users = result.scalars().all()

    items = []
    for i, u in enumerate(users):
        badge = LEVEL_CONFIG.get(u.level, {}).get("icon", "")
        items.append({
            "rank": i + 1, "userId": u.id, "nickname": u.nickname or u.username,
            "avatarUrl": u.avatar_url, "level": u.level, "value": u.experience, "badge": badge,
        })
    return {"list": items}


_CHECK_IN_STORE: dict[int, tuple[str, int]] = {}


async def check_in(db: AsyncSession, user_id: int) -> dict:
    today = datetime.date.today().isoformat()
    prev_date, streak = _CHECK_IN_STORE.get(user_id, ("", 0))

    if prev_date == today:
        raise AppException(ERR_ALREADY_CHECKED_IN, "今日已签到")

    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    if prev_date == yesterday:
        streak += 1
    else:
        streak = 1

    points = POINTS_CHECK_IN_BASE + min(streak - 1, 6)  # Max +6 for 7-day streak
    _CHECK_IN_STORE[user_id] = (today, streak)

    user = await db.get(SysUser, user_id)
    if user:
        user.experience = (user.experience or 0) + points
        await db.flush()

    return {"pointsEarned": points, "consecutiveDays": streak, "totalPoints": user.experience if user else points}
