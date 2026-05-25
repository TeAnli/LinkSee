from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import async_session
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


def start_scheduler():
    scheduler.add_job(_publish_due_posts, "interval", seconds=60, id="publish_scheduled")
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown(wait=False)
