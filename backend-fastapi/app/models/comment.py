import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, ForeignKey, Identity, Integer, SmallInteger, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ForumComment(Base):
    __tablename__ = "forum_comment"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    post_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("forum_post.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), nullable=False)
    parent_id: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("forum_comment.id"), default=None)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    like_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    post: Mapped["ForumPost"] = relationship(back_populates="comments")
    author: Mapped["SysUser"] = relationship(foreign_keys=[user_id])
    parent: Mapped[Optional["ForumComment"]] = relationship(back_populates="children", remote_side=[id])
    children: Mapped[list["ForumComment"]] = relationship(back_populates="parent")
