import datetime
import uuid

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.ai_chat import AiChatSession, AiChatMessage


class ChatMemoryService:

    def __init__(self, db: AsyncSession):
        self._db = db

    async def get_or_create_session(self, user_id: int, session_id: str | None = None) -> str:
        if session_id:
            session = await self._db.get(AiChatSession, session_id)
            if session and session.user_id == user_id:
                return session_id
        new_id = f"sess_{uuid.uuid4().hex[:12]}"
        session = AiChatSession(id=new_id, user_id=user_id, title="新对话")
        self._db.add(session)
        await self._db.flush()
        return new_id

    async def load_history(self, session_id: str, max_messages: int = 20) -> list[BaseMessage]:
        stmt = (
            select(AiChatMessage)
            .where(AiChatMessage.session_id == session_id)
            .order_by(AiChatMessage.created_at.desc())
            .limit(max_messages)
        )
        result = await self._db.execute(stmt)
        messages = result.scalars().all()

        history: list[BaseMessage] = []
        for msg in reversed(messages):
            if msg.role == "user":
                history.append(HumanMessage(content=msg.content))
            else:
                history.append(AIMessage(content=msg.content))
        return history

    async def save_exchange(
        self,
        session_id: str,
        user_id: int,
        question: str,
        answer: str,
        sources: list | None = None,
    ):
        session = await self._db.get(AiChatSession, session_id)
        if session:
            session.message_count = (session.message_count or 0) + 2
            session.updated_at = datetime.datetime.now(tz=datetime.timezone(datetime.timedelta(hours=8)))
            if session.title == "新对话":
                session.title = question[:50]

        user_msg = AiChatMessage(
            session_id=session_id, role="user", content=question,
        )
        ai_msg = AiChatMessage(
            session_id=session_id, role="assistant", content=answer,
            sources=sources or [],
        )
        self._db.add(user_msg)
        self._db.add(ai_msg)
        await self._db.flush()

    async def get_sessions(self, user_id: int) -> list[dict]:
        stmt = (
            select(AiChatSession)
            .where(AiChatSession.user_id == user_id)
            .order_by(AiChatSession.updated_at.desc())
        )
        result = await self._db.execute(stmt)
        sessions = result.scalars().all()

        return [
            {
                "id": s.id,
                "title": s.title,
                "lastMessageAt": s.updated_at.isoformat() if s.updated_at else None,
                "messageCount": s.message_count,
                "firstQuestion": s.title if s.title != "新对话" else "",
            }
            for s in sessions
        ]

    async def get_messages(self, session_id: str, user_id: int) -> list[dict]:
        session = await self._db.get(AiChatSession, session_id)
        if not session or session.user_id != user_id:
            return []

        stmt = (
            select(AiChatMessage)
            .where(AiChatMessage.session_id == session_id)
            .order_by(AiChatMessage.created_at.asc())
        )
        result = await self._db.execute(stmt)
        messages = result.scalars().all()

        return [
            {
                "role": m.role,
                "content": m.content,
                "sources": m.sources or [],
                "createdAt": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ]

    async def delete_session(self, session_id: str, user_id: int):
        session = await self._db.get(AiChatSession, session_id)
        if session and session.user_id == user_id:
            await self._db.delete(session)
            await self._db.flush()
