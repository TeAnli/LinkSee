import datetime

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Integer, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AiTaskRecord(Base):
    __tablename__ = "ai_task_record"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    task_type: Mapped[str] = mapped_column(String(30), nullable=False)
    input_summary: Mapped[str] = mapped_column(Text, default="")
    output_content: Mapped[str | None] = mapped_column(Text, default=None)
    model_used: Mapped[str] = mapped_column(String(50), nullable=False)
    tokens_input: Mapped[int] = mapped_column(Integer, default=0)
    tokens_output: Mapped[int] = mapped_column(Integer, default=0)
    response_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    error_message: Mapped[str] = mapped_column(Text, default="")
    target_type: Mapped[str] = mapped_column(String(20), default="")
    target_id: Mapped[int] = mapped_column(BigInteger, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
