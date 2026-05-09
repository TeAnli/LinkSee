import datetime
from typing import Optional

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Identity, SmallInteger, String, Table, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

sys_user_role = Table(
    "sys_user_role",
    Base.metadata,
    Column("user_id", BigInteger, ForeignKey("sys_user.id"), primary_key=True),
    Column("role_id", BigInteger, ForeignKey("sys_role.id"), primary_key=True),
)


class SysRole(Base):
    __tablename__ = "sys_role"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    role_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    role_name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(String(200), default="")
    permissions: Mapped[list] = mapped_column(JSONB, default=list)
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    deleted: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    users: Mapped[list["SysUser"]] = relationship(secondary="sys_user_role", back_populates="roles")
