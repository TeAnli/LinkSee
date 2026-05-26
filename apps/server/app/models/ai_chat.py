import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AiChatSession(Base):
    __tablename__ = "ai_chat_session"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), default="")
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class AiChatMessage(Base):
    __tablename__ = "ai_chat_message"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    session_id: Mapped[str] = mapped_column(String(50), ForeignKey("ai_chat_session.id"), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[list] = mapped_column(JSONB, default=list)
    tokens_input: Mapped[int] = mapped_column(Integer, default=0)
    tokens_output: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
