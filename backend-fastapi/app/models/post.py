import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, Double, ForeignKey, Identity, Integer, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ForumPost(Base):
    __tablename__ = "forum_post"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    author_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("forum_category.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    cover_image_url: Mapped[str] = mapped_column(String(500), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    tag_list: Mapped[list] = mapped_column(JSONB, default=list)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    like_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    comment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    collect_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    is_top: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_essence: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    sort_weight: Mapped[float] = mapped_column(Double, default=0, nullable=False)
    published_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    author: Mapped["SysUser"] = relationship(foreign_keys=[author_id])
    category: Mapped["ForumCategory"] = relationship(foreign_keys=[category_id])
    ai_data: Mapped[Optional["ForumPostAiData"]] = relationship(back_populates="post", uselist=False)
    comments: Mapped[list["ForumComment"]] = relationship(back_populates="post")
