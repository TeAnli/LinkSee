import datetime
from typing import Optional

from sqlalchemy import BigInteger, Boolean, DateTime, ForeignKey, Identity, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SysUserProfile(Base):
    __tablename__ = "sys_user_profile"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("sys_user.id"), unique=True, nullable=False)
    bio: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(100), default="")
    personal_website: Mapped[str] = mapped_column(String(500), default="")
    social_links: Mapped[dict] = mapped_column(JSONB, default=dict)
    skills_tags: Mapped[list] = mapped_column(JSONB, default=list)
    education: Mapped[str] = mapped_column(String(200), default="")
    occupation: Mapped[str] = mapped_column(String(100), default="")
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    verify_info: Mapped[dict] = mapped_column(JSONB, default=dict)
    follower_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    following_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["SysUser"] = relationship(back_populates="profile")
