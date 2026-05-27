import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import update

from app.constants import USER_STATUS_MUTED, USER_STATUS_NORMAL
from app.database import async_session
from app.models.user import SysUser
from app.services.forum_service import publish_scheduled_posts

scheduler = AsyncIOScheduler()


async def _publish_due_posts():
    async with async_session() as db:
        try:
            count = await publish_scheduled_posts(db)
            if count > 0:
                await db.commit()
        except Exception:
            await db.rollback()


async def _lift_expired_mutes():
    """自动解除过期的禁言"""
    async with async_session() as db:
        try:
            now = datetime.datetime.now(datetime.timezone.utc)
            result = await db.execute(
                update(SysUser)
                .where(
                    SysUser.status == USER_STATUS_MUTED,
                    SysUser.mute_until.is_not(None),
                    SysUser.mute_until <= now,
                )
                .values(status=USER_STATUS_NORMAL, mute_until=None)
            )
            if result.rowcount and result.rowcount > 0:
                await db.commit()
        except Exception:
            await db.rollback()


def start_scheduler():
    scheduler.add_job(_publish_due_posts, "interval", seconds=60, id="publish_scheduled")
    scheduler.add_job(_lift_expired_mutes, "interval", seconds=60, id="lift_mutes")
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown(wait=False)
