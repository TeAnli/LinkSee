import datetime

from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Identity, String, Table, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

sys_user_role = Table(
    "sys_user_role",
    Base.metadata,
    Column("id", BigInteger, Identity(), primary_key=True),
    Column("user_id", BigInteger, ForeignKey("sys_user.id"), nullable=False),
    Column("role_id", BigInteger, ForeignKey("sys_role.id"), nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    UniqueConstraint("user_id", "role_id"),
)


class SysRole(Base):
    __tablename__ = "sys_role"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    users: Mapped[list["SysUser"]] = relationship(secondary="sys_user_role", back_populates="roles")
