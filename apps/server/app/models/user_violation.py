import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class UserViolationRecord(Base):
    __tablename__ = "user_violation_record"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), nullable=False)
    content_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    violation_type: Mapped[str] = mapped_column(String(50), nullable=False)
    violation_category: Mapped[str] = mapped_column(String(50), default="")
    penalty_points: Mapped[int] = mapped_column(Integer, default=1)
    action_taken: Mapped[str] = mapped_column(String(20), default="warn")
    moderator_id: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    reason: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
