import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Identity, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class MessageNotice(Base):
    __tablename__ = "message_notice"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    notice_type: Mapped[str] = mapped_column(String(20), nullable=False)
    sub_type: Mapped[str] = mapped_column(String(20), default="")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, default="")
    receiver_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    sender_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("sys_user.id"), default=None)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    target_type: Mapped[str] = mapped_column(String(20), default="")
    target_id: Mapped[int] = mapped_column(BigInteger, default=0)
    post_id: Mapped[Optional[int]] = mapped_column(BigInteger, default=None)
    extra_data: Mapped[dict] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
