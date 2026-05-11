import datetime
from typing import Optional

from sqlalchemy import BigInteger, DateTime, Identity, Integer, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class SysUser(Base):
    __tablename__ = "sys_user"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    nickname: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    email: Mapped[str] = mapped_column(String(100), default="")
    level: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    daily_ai_calls: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    last_login_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    profile: Mapped[Optional["SysUserProfile"]] = relationship(back_populates="user", uselist=False)
    roles: Mapped[list["SysRole"]] = relationship(secondary="sys_user_role", back_populates="users")
