"""Add user_violation_record table and mute_until to sys_user

Revision ID: 003
Revises: 002
Create Date: 2026-05-27
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_violation_record",
        sa.Column("id", sa.BigInteger(), sa.Identity(), primary_key=True),
        sa.Column("user_id", sa.BigInteger(), sa.ForeignKey("sys_user.id"), nullable=False),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content_id", sa.BigInteger(), nullable=False),
        sa.Column("violation_type", sa.String(50), nullable=False),
        sa.Column("violation_category", sa.String(50), server_default=""),
        sa.Column("penalty_points", sa.Integer(), server_default="1"),
        sa.Column("action_taken", sa.String(20), server_default="warn"),
        sa.Column("moderator_id", sa.BigInteger(), nullable=True),
        sa.Column("reason", sa.Text(), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("idx_violation_user", "user_violation_record", ["user_id", sa.text("created_at DESC")])

    op.add_column(
        "sys_user",
        sa.Column("mute_until", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_index("idx_violation_user", table_name="user_violation_record")
    op.drop_table("user_violation_record")
    op.drop_column("sys_user", "mute_until")
