from sqlalchemy import and_, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import MessageNotice


async def list_notifications(
    db: AsyncSession, user_id: int, notice_type: str = "all",
    read_status: str = "all", page: int = 1, size: int = 20,
) -> dict:
    conditions = [MessageNotice.receiver_id == user_id]
    if notice_type != "all":
        conditions.append(MessageNotice.type == notice_type)
    if read_status == "unread":
        conditions.append(MessageNotice.is_read == False)
    elif read_status == "read":
        conditions.append(MessageNotice.is_read == True)

    unread_count = (await db.execute(
        select(func.count(MessageNotice.id)).where(MessageNotice.receiver_id == user_id, MessageNotice.is_read == False)
    )).scalar()

    count_stmt = select(func.count(MessageNotice.id)).where(and_(*conditions))
    total = (await db.execute(count_stmt)).scalar()

    stmt = select(MessageNotice).where(and_(*conditions)).order_by(MessageNotice.created_at.desc()).offset((page - 1) * size).limit(size)
    result = await db.execute(stmt)
    notices = result.scalars().all()

    items = []
    for n in notices:
        items.append({
            "id": n.id, "type": n.type,
            "title": n.title, "content": n.content,
            "relatedId": n.related_id,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat() if n.created_at else None,
        })

    return {"total": total, "unreadCount": unread_count, "list": items}


async def mark_read(db: AsyncSession, notice_id: int, user_id: int):
    await db.execute(
        update(MessageNotice).where(MessageNotice.id == notice_id, MessageNotice.receiver_id == user_id).values(is_read=True)
    )
    await db.flush()


async def mark_all_read(db: AsyncSession, user_id: int, notice_type: str | None = None):
    conditions = [MessageNotice.receiver_id == user_id, MessageNotice.is_read == False]
    if notice_type:
        conditions.append(MessageNotice.type == notice_type)
    result = await db.execute(update(MessageNotice).where(and_(*conditions)).values(is_read=True))
    await db.flush()
    return {"markedCount": result.rowcount}


async def unread_count(db: AsyncSession, user_id: int) -> dict:
    total = (await db.execute(
        select(func.count(MessageNotice.id)).where(MessageNotice.receiver_id == user_id, MessageNotice.is_read == False)
    )).scalar()
    interaction = (await db.execute(
        select(func.count(MessageNotice.id)).where(MessageNotice.receiver_id == user_id, MessageNotice.is_read == False, MessageNotice.type == "interaction")
    )).scalar()
    system = (await db.execute(
        select(func.count(MessageNotice.id)).where(MessageNotice.receiver_id == user_id, MessageNotice.is_read == False, MessageNotice.type == "system")
    )).scalar()
    ai = (await db.execute(
        select(func.count(MessageNotice.id)).where(MessageNotice.receiver_id == user_id, MessageNotice.is_read == False, MessageNotice.type == "ai")
    )).scalar()
    return {"total": total, "interaction": interaction, "system": system, "ai": ai}
