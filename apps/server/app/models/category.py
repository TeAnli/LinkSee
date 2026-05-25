import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Integer, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ForumCategory(Base):
    __tablename__ = "forum_category"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), default="")
    parent_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("forum_category.id"), default=None)
    description: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    post_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    theme_color: Mapped[str] = mapped_column(String(20), default="#1890ff")
    post_template: Mapped[dict] = mapped_column(JSONB, default=dict)
    ai_persona: Mapped[str] = mapped_column(String(200), default="专业友好的助手")
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    children: Mapped[list["ForumCategory"]] = relationship(
        "ForumCategory", back_populates="parent",
        foreign_keys=[parent_id],
    )
    parent: Mapped[Optional["ForumCategory"]] = relationship(
        "ForumCategory", back_populates="children",
        remote_side=[id],
    )
