"""违规记录与自动处罚服务"""

import datetime

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.constants import (
    USER_STATUS_DISABLED,
    USER_STATUS_MUTED,
    USER_STATUS_NORMAL,
    VIOLATION_BAN_THRESHOLD,
    VIOLATION_MUTE_24H_THRESHOLD,
    VIOLATION_MUTE_7D_THRESHOLD,
    VIOLATION_WINDOW_DAYS,
)
from app.models.user import SysUser
from app.models.user_violation import UserViolationRecord


async def count_recent_violations(db: AsyncSession, user_id: int) -> int:
    """统计用户近 N 天的违规次数"""
    since = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=VIOLATION_WINDOW_DAYS)
    result = await db.execute(
        select(func.count(UserViolationRecord.id)).where(
            UserViolationRecord.user_id == user_id,
            UserViolationRecord.created_at >= since,
        )
    )
    return result.scalar() or 0


def _determine_action(violation_count: int) -> tuple[str, int | None, str]:
    """根据违规次数决定处罚措施，返回 (action_type, new_status, mute_duration_desc)"""
    if violation_count >= VIOLATION_BAN_THRESHOLD:
        return ("ban", USER_STATUS_DISABLED, "永久封禁")
    elif violation_count >= VIOLATION_MUTE_7D_THRESHOLD:
        return ("mute", USER_STATUS_MUTED, "禁言 7 天")
    elif violation_count >= VIOLATION_MUTE_24H_THRESHOLD:
        return ("mute", USER_STATUS_MUTED, "禁言 24 小时")
    else:
        return ("warn", None, "警告")


async def record_violation(
    db: AsyncSession,
    user_id: int,
    content_type: str,
    content_id: int,
    violation_type: str,
    violation_category: str = "",
    penalty_points: int = 1,
    moderator_id: int | None = None,
    reason: str = "",
) -> dict:
    """记录违规并自动执行升级处罚"""
    # 1. 插入违规记录
    record = UserViolationRecord(
        user_id=user_id,
        content_type=content_type,
        content_id=content_id,
        violation_type=violation_type,
        violation_category=violation_category,
        penalty_points=penalty_points,
        moderator_id=moderator_id,
        reason=reason,
    )
    db.add(record)
    await db.flush()

    # 2. 统计近期违规次数
    violation_count = await count_recent_violations(db, user_id)

    # 3. 判断处罚
    action_type, new_status, desc = _determine_action(violation_count)

    # 4. 更新违规记录中的处罚动作
    record.action_taken = action_type
    if new_status is not None:
        # 执行处罚
        if action_type == "ban":
            mute_until = None
        elif action_type == "mute":
            if violation_count >= VIOLATION_MUTE_7D_THRESHOLD:
                mute_until = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
            else:
                mute_until = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        else:
            mute_until = None

        await db.execute(
            update(SysUser)
            .where(SysUser.id == user_id)
            .values(status=new_status, mute_until=mute_until)
        )
    await db.flush()

    return {
        "violationId": record.id,
        "violationCount": violation_count,
        "actionTaken": action_type,
        "description": desc,
    }


async def get_user_violation_summary(db: AsyncSession, user_id: int) -> dict:
    """获取用户违规摘要"""
    total = await db.execute(
        select(func.count(UserViolationRecord.id)).where(UserViolationRecord.user_id == user_id)
    )
    recent = await count_recent_violations(db, user_id)

    user = await db.get(SysUser, user_id)
    current_status = user.status if user else USER_STATUS_NORMAL
    mute_until = user.mute_until.isoformat() if (user and user.mute_until) else None

    return {
        "totalViolations": total.scalar() or 0,
        "recentViolations": recent,
        "currentStatus": current_status,
        "muteUntil": mute_until,
    }


async def get_user_violations(
    db: AsyncSession, user_id: int, page: int = 1, size: int = 20,
) -> dict:
    """分页获取用户违规记录"""
    count_stmt = select(func.count(UserViolationRecord.id)).where(UserViolationRecord.user_id == user_id)
    total = (await db.execute(count_stmt)).scalar() or 0

    stmt = (
        select(UserViolationRecord)
        .where(UserViolationRecord.user_id == user_id)
        .order_by(UserViolationRecord.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
    )
    result = await db.execute(stmt)
    records = result.scalars().all()

    items = []
    for r in records:
        items.append({
            "id": r.id,
            "contentType": r.content_type,
            "contentId": r.content_id,
            "violationType": r.violation_type,
            "violationCategory": r.violation_category,
            "penaltyPoints": r.penalty_points,
            "actionTaken": r.action_taken,
            "moderatorId": r.moderator_id,
            "reason": r.reason,
            "createdAt": r.created_at.isoformat() if r.created_at else None,
        })

    return {"total": total, "list": items}


async def lift_penalty(db: AsyncSession, user_id: int) -> dict:
    """管理员手动解除处罚"""
    await db.execute(
        update(SysUser)
        .where(SysUser.id == user_id)
        .values(status=USER_STATUS_NORMAL, mute_until=None)
    )
    await db.flush()
    return {"userId": user_id, "status": USER_STATUS_NORMAL}
