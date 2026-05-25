"""Initial schema — all 12 tables from init.sql

Revision ID: 001
Revises:
Create Date: 2026-05-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # sys_user
    op.create_table(
        "sys_user",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("username", sa.String(50), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("nickname", sa.String(50), nullable=False, server_default=""),
        sa.Column("avatar_url", sa.String(500), server_default=""),
        sa.Column("email", sa.String(100), server_default=""),
        sa.Column("level", sa.SmallInteger(), nullable=False, server_default="1"),
        sa.Column("experience", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("daily_ai_calls", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.SmallInteger(), nullable=False, server_default="1"),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.create_index("idx_sys_user_username", "sys_user", ["username"])
    op.create_index("idx_sys_user_email", "sys_user", ["email"])
    op.create_index("idx_sys_user_status", "sys_user", ["status"], postgresql_where=sa.text("deleted = 0"))

    # sys_user_profile
    op.create_table(
        "sys_user_profile",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("bio", sa.Text(), server_default=""),
        sa.Column("location", sa.String(100), server_default=""),
        sa.Column("personal_website", sa.String(500), server_default=""),
        sa.Column("social_links", postgresql.JSONB(), server_default="{}"),
        sa.Column("skills_tags", postgresql.JSONB(), server_default="[]"),
        sa.Column("education", sa.String(200), server_default=""),
        sa.Column("occupation", sa.String(100), server_default=""),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("verify_info", postgresql.JSONB(), server_default="{}"),
        sa.Column("follower_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("following_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"]),
    )

    # sys_role
    op.create_table(
        "sys_role",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
    )

    # sys_user_role
    op.create_table(
        "sys_user_role",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("role_id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "role_id"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"]),
        sa.ForeignKeyConstraint(["role_id"], ["sys_role.id"]),
    )

    # forum_category
    op.create_table(
        "forum_category",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("icon", sa.String(50), server_default=""),
        sa.Column("parent_id", sa.BigInteger(), nullable=True),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("post_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("theme_color", sa.String(20), server_default="#1890ff"),
        sa.Column("post_template", postgresql.JSONB(), server_default="{}"),
        sa.Column("ai_persona", sa.String(200), server_default="专业友好的助手"),
        sa.Column("status", sa.SmallInteger(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["parent_id"], ["forum_category.id"]),
    )
    op.create_index("idx_forum_category_parent", "forum_category", ["parent_id"], postgresql_where=sa.text("deleted = 0"))

    # forum_post
    op.create_table(
        "forum_post",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("author_id", sa.BigInteger(), nullable=False),
        sa.Column("category_id", sa.BigInteger(), nullable=False),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("cover_image_url", sa.String(500), server_default=""),
        sa.Column("summary", sa.Text(), server_default=""),
        sa.Column("tag_list", postgresql.JSONB(), server_default="[]"),
        sa.Column("view_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("like_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("comment_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("collect_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("is_top", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_essence", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("sort_weight", sa.Double(), nullable=False, server_default="0"),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["author_id"], ["sys_user.id"]),
        sa.ForeignKeyConstraint(["category_id"], ["forum_category.id"]),
    )
    op.create_index("idx_forum_post_author", "forum_post", ["author_id"], postgresql_where=sa.text("deleted = 0 AND status = 1"))
    op.create_index("idx_forum_post_category", "forum_post", ["category_id"], postgresql_where=sa.text("deleted = 0 AND status = 1"))
    op.create_index("idx_forum_post_status", "forum_post", ["status", sa.text("created_at DESC")], postgresql_where=sa.text("deleted = 0"))
    op.create_index("idx_forum_post_hot", "forum_post", [sa.text("sort_weight DESC")], postgresql_where=sa.text("deleted = 0 AND status = 1"))
    op.create_index("idx_forum_post_published", "forum_post", [sa.text("published_at DESC")], postgresql_where=sa.text("deleted = 0 AND status = 1"))

    # forum_post_ai_data
    op.create_table(
        "forum_post_ai_data",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("post_id", sa.BigInteger(), nullable=False),
        sa.Column("ai_summary", sa.Text(), server_default=""),
        sa.Column("ai_keywords", postgresql.JSONB(), server_default="[]"),
        sa.Column("sentiment", sa.SmallInteger(), server_default="0"),
        sa.Column("quality_score", sa.Double(), server_default="0"),
        sa.Column("estimated_read_minutes", sa.Integer(), server_default="0"),
        sa.Column("vector_id", sa.String(100), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("post_id"),
        sa.ForeignKeyConstraint(["post_id"], ["forum_post.id"]),
    )

    # forum_comment
    op.create_table(
        "forum_comment",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("post_id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("parent_id", sa.BigInteger(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("like_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.SmallInteger(), nullable=False, server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("deleted", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["post_id"], ["forum_post.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"]),
        sa.ForeignKeyConstraint(["parent_id"], ["forum_comment.id"]),
    )
    op.create_index("idx_forum_comment_post", "forum_comment", ["post_id", sa.text("created_at ASC")], postgresql_where=sa.text("deleted = 0 AND status = 1"))
    op.create_index("idx_forum_comment_parent", "forum_comment", ["parent_id"], postgresql_where=sa.text("deleted = 0"))

    # forum_like_record
    op.create_table(
        "forum_like_record",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("target_type", sa.String(20), nullable=False),
        sa.Column("target_id", sa.BigInteger(), nullable=False),
        sa.Column("action_type", sa.String(20), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "target_type", "target_id", "action_type"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"]),
    )

    # forum_follow
    op.create_table(
        "forum_follow",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("follower_id", sa.BigInteger(), nullable=False),
        sa.Column("following_id", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("follower_id", "following_id"),
        sa.ForeignKeyConstraint(["follower_id"], ["sys_user.id"]),
        sa.ForeignKeyConstraint(["following_id"], ["sys_user.id"]),
    )

    # ai_task_record
    op.create_table(
        "ai_task_record",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("task_type", sa.String(30), nullable=False),
        sa.Column("input_summary", sa.Text(), server_default=""),
        sa.Column("output_content", sa.Text(), nullable=True),
        sa.Column("model_used", sa.String(50), nullable=False),
        sa.Column("tokens_input", sa.Integer(), server_default="0"),
        sa.Column("tokens_output", sa.Integer(), server_default="0"),
        sa.Column("response_ms", sa.Integer(), server_default="0"),
        sa.Column("status", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text(), server_default=""),
        sa.Column("target_type", sa.String(20), server_default=""),
        sa.Column("target_id", sa.BigInteger(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["sys_user.id"]),
    )
    op.create_index("idx_ai_task_user", "ai_task_record", ["user_id", sa.text("created_at DESC")])
    op.create_index("idx_ai_task_type", "ai_task_record", ["task_type", sa.text("created_at DESC")])
    op.create_index("idx_ai_task_status", "ai_task_record", ["status", sa.text("created_at DESC")])

    # ai_moderation_log
    op.create_table(
        "ai_moderation_log",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("content_id", sa.BigInteger(), nullable=False),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("result", sa.SmallInteger(), nullable=False, server_default="0"),
        sa.Column("violation_type", sa.String(50), server_default=""),
        sa.Column("confidence", sa.Double(), server_default="0"),
        sa.Column("action", sa.String(20), server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    # message_notice
    op.create_table(
        "message_notice",
        sa.Column("id", sa.BigInteger(), sa.Identity(), nullable=False),
        sa.Column("receiver_id", sa.BigInteger(), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("title", sa.String(200), nullable=False, server_default=""),
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
        sa.Column("is_read", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("related_id", sa.BigInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["receiver_id"], ["sys_user.id"]),
    )
    op.create_index("idx_notice_receiver", "message_notice", ["receiver_id", sa.text("created_at DESC")], postgresql_where=sa.text("is_read = FALSE"))
    op.create_index("idx_notice_type", "message_notice", ["receiver_id", "type"], postgresql_where=sa.text("is_read = FALSE"))

    # Seed default roles
    op.execute("""
        INSERT INTO sys_role (code, name, description) VALUES
        ('user', '普通用户', '基础发帖评论互动权限'),
        ('verified', '认证用户', '专业认证标识，可使用AI问答'),
        ('moderator', '板块版主', '指定板块管理权'),
        ('admin', '站点管理员', '全局管理权限'),
        ('super_admin', '超级管理员', '系统Owner，全局最高权限')
    """)


def downgrade() -> None:
    op.drop_table("message_notice")
    op.drop_table("ai_moderation_log")
    op.drop_index("idx_ai_task_status", table_name="ai_task_record")
    op.drop_index("idx_ai_task_type", table_name="ai_task_record")
    op.drop_index("idx_ai_task_user", table_name="ai_task_record")
    op.drop_table("ai_task_record")
    op.drop_table("forum_follow")
    op.drop_table("forum_like_record")
    op.drop_index("idx_forum_comment_parent", table_name="forum_comment")
    op.drop_index("idx_forum_comment_post", table_name="forum_comment")
    op.drop_table("forum_comment")
    op.drop_table("forum_post_ai_data")
    op.drop_index("idx_forum_post_published", table_name="forum_post")
    op.drop_index("idx_forum_post_hot", table_name="forum_post")
    op.drop_index("idx_forum_post_status", table_name="forum_post")
    op.drop_index("idx_forum_post_category", table_name="forum_post")
    op.drop_index("idx_forum_post_author", table_name="forum_post")
    op.drop_table("forum_post")
    op.drop_index("idx_forum_category_parent", table_name="forum_category")
    op.drop_table("forum_category")
    op.drop_table("sys_user_role")
    op.drop_table("sys_role")
    op.drop_table("sys_user_profile")
    op.drop_index("idx_sys_user_status", table_name="sys_user")
    op.drop_index("idx_sys_user_email", table_name="sys_user")
    op.drop_index("idx_sys_user_username", table_name="sys_user")
    op.drop_table("sys_user")
