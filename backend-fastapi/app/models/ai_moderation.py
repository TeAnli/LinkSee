import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Double, Identity, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class AiModerationLog(Base):
    __tablename__ = "ai_moderation_log"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    content_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    content_type: Mapped[str] = mapped_column(String(20), nullable=False)
    moderation_result: Mapped[str] = mapped_column(String(20), nullable=False)
    violation_type: Mapped[str] = mapped_column(String(50), default="")
    confidence: Mapped[float] = mapped_column(Double, default=0)
    action_taken: Mapped[str] = mapped_column(String(20), default="")
    reviewer_id: Mapped[Optional[int]] = mapped_column(BigInteger, default=None)
    review_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
