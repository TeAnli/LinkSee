-- ============================================================
-- LinkSee 灵犀 — Database Initialization Script
-- Database: PostgreSQL 16
-- Schema: linksee
-- ============================================================

-- 强制客户端编码为 UTF-8，避免 Windows GBK 环境乱码
SET client_encoding = 'UTF8';

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. sys_user (用户主表)
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL DEFAULT '',
    avatar_url VARCHAR(500) DEFAULT '',
    email VARCHAR(100) DEFAULT '',
    level SMALLINT NOT NULL DEFAULT 1,
    experience INT NOT NULL DEFAULT 0,
    daily_ai_calls INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sys_user_username ON sys_user (username);

CREATE INDEX IF NOT EXISTS idx_sys_user_email ON sys_user (email);

CREATE INDEX IF NOT EXISTS idx_sys_user_status ON sys_user (status)
WHERE
    deleted = 0;

-- ============================================================
-- 2. sys_user_profile (用户扩展表)
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_user_profile (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES sys_user (id),
    bio TEXT DEFAULT '',
    location VARCHAR(100) DEFAULT '',
    personal_website VARCHAR(500) DEFAULT '',
    social_links JSONB DEFAULT '{}',
    skills_tags JSONB DEFAULT '[]',
    education VARCHAR(200) DEFAULT '',
    occupation VARCHAR(100) DEFAULT '',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verify_info JSONB DEFAULT '{}',
    follower_count INT NOT NULL DEFAULT 0,
    following_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. sys_role & sys_user_role (角色表)
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_role (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sys_user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    role_id BIGINT NOT NULL REFERENCES sys_role (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role_id)
);

-- Insert default roles
INSERT INTO
    sys_role (code, name, description)
VALUES ('user', '普通用户', '基础发帖评论互动权限'),
    (
        'verified',
        '认证用户',
        '专业认证标识，可使用AI问答'
    ),
    (
        'moderator',
        '板块版主',
        '指定板块管理权'
    ),
    ('admin', '站点管理员', '全局管理权限'),
    (
        'super_admin',
        '超级管理员',
        '系统Owner，全局最高权限'
    ) ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 4. forum_category (板块分类表)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT '',
    parent_id BIGINT DEFAULT NULL,
    description TEXT DEFAULT '',
    sort_order INT NOT NULL DEFAULT 0,
    post_count INT NOT NULL DEFAULT 0,
    theme_color VARCHAR(20) DEFAULT '#1890ff',
    post_template JSONB DEFAULT '{}',
    ai_persona VARCHAR(200) DEFAULT '专业友好的助手',
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_forum_category_parent ON forum_category (parent_id)
WHERE
    deleted = 0;

-- ============================================================
-- 5. forum_post (帖子主表)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_post (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL REFERENCES sys_user (id),
    category_id BIGINT NOT NULL REFERENCES forum_category (id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(500) DEFAULT '',
    summary TEXT DEFAULT '',
    tag_list JSONB DEFAULT '[]',
    view_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    collect_count INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 0,
    is_top BOOLEAN NOT NULL DEFAULT FALSE,
    is_essence BOOLEAN NOT NULL DEFAULT FALSE,
    sort_weight DOUBLE PRECISION NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_forum_post_author ON forum_post (author_id)
WHERE
    deleted = 0
    AND status = 1;

CREATE INDEX IF NOT EXISTS idx_forum_post_category ON forum_post (category_id)
WHERE
    deleted = 0
    AND status = 1;

CREATE INDEX IF NOT EXISTS idx_forum_post_status ON forum_post (status, created_at DESC)
WHERE
    deleted = 0;

CREATE INDEX IF NOT EXISTS idx_forum_post_hot ON forum_post (sort_weight DESC)
WHERE
    deleted = 0
    AND status = 1;

CREATE INDEX IF NOT EXISTS idx_forum_post_published ON forum_post (published_at DESC)
WHERE
    deleted = 0
    AND status = 1;

-- ============================================================
-- 6. forum_post_ai_data (帖子AI增强数据)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_post_ai_data (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL UNIQUE REFERENCES forum_post (id),
    ai_summary TEXT DEFAULT '',
    ai_keywords JSONB DEFAULT '[]',
    sentiment SMALLINT DEFAULT 0,
    quality_score DOUBLE PRECISION DEFAULT 0,
    estimated_read_minutes INT DEFAULT 0,
    vector_id VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. forum_comment (评论表)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_comment (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES forum_post (id),
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    parent_id BIGINT DEFAULT NULL,
    content TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_forum_comment_post ON forum_comment (post_id, created_at ASC)
WHERE
    deleted = 0
    AND status = 1;

CREATE INDEX IF NOT EXISTS idx_forum_comment_parent ON forum_comment (parent_id)
WHERE
    deleted = 0;

-- ============================================================
-- 8. forum_like_record (点赞收藏记录)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_like_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    target_type VARCHAR(20) NOT NULL,
    target_id BIGINT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (
        user_id,
        target_type,
        target_id,
        action_type
    )
);

-- ============================================================
-- 9. forum_follow (关注关系表)
-- ============================================================
CREATE TABLE IF NOT EXISTS forum_follow (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT NOT NULL REFERENCES sys_user (id),
    following_id BIGINT NOT NULL REFERENCES sys_user (id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (follower_id, following_id)
);

-- ============================================================
-- 10. ai_task_record (AI任务调用记录)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_task_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    task_type VARCHAR(30) NOT NULL,
    input_summary TEXT DEFAULT '',
    output_content TEXT,
    model_used VARCHAR(50) NOT NULL,
    tokens_input INT DEFAULT 0,
    tokens_output INT DEFAULT 0,
    response_ms INT DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 0,
    error_message TEXT DEFAULT '',
    target_type VARCHAR(20) DEFAULT '',
    target_id BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_task_user ON ai_task_record (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_task_type ON ai_task_record (task_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_task_status ON ai_task_record (status, created_at DESC);

-- ============================================================
-- 11. ai_moderation_log (AI审核日志)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_moderation_log (
    id BIGSERIAL PRIMARY KEY,
    content_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    result SMALLINT NOT NULL DEFAULT 0,
    violation_type VARCHAR(50) DEFAULT '',
    confidence DOUBLE PRECISION DEFAULT 0,
    action VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 12. message_notice (消息通知表)
-- ============================================================
CREATE TABLE IF NOT EXISTS message_notice (
    id BIGSERIAL PRIMARY KEY,
    receiver_id BIGINT NOT NULL REFERENCES sys_user (id),
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id BIGINT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notice_receiver ON message_notice (receiver_id, created_at DESC)
WHERE
    is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notice_type ON message_notice(receiver_id, type) WHERE is_read = FALSE;

-- ============================================================
-- 13. user_level_log (用户等级变动日志)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_level_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    old_level SMALLINT NOT NULL,
    new_level SMALLINT NOT NULL,
    reason VARCHAR(200) NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 14. ai_chat_session (AI对话会话)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_session (
    id VARCHAR(50) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    title VARCHAR(200) NOT NULL DEFAULT '新对话',
    message_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_session_user ON ai_chat_session (user_id, updated_at DESC);

-- ============================================================
-- 15. ai_chat_message (AI对话消息)
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_chat_message (
    id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL REFERENCES ai_chat_session (id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    sources JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_message_session ON ai_chat_message (session_id, created_at ASC);

-- ============================================================
-- Initial data: default super admin
-- Password: admin123 (BCrypt hash)
-- ============================================================
INSERT INTO
    sys_user (
        username,
        password_hash,
        nickname,
        level,
        experience,
        status
    )
VALUES (
        'admin',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
        '管理员',
        6,
        10000,
        1
    ) ON CONFLICT (username) DO NOTHING;

INSERT INTO
    sys_user_role (user_id, role_id)
SELECT u.id, r.id
FROM sys_user u, sys_role r
WHERE
    u.username = 'admin'
    AND r.code = 'super_admin' ON CONFLICT DO NOTHING;

INSERT INTO
    sys_user_profile (
        user_id,
        bio,
        occupation,
        is_verified
    )
SELECT u.id, 'LinkSee 系统管理员', '全栈开发', TRUE
FROM sys_user u
WHERE
    u.username = 'admin' ON CONFLICT DO NOTHING;

-- ============================================================
-- 16. check_in_record (签到记录表)
-- ============================================================
CREATE TABLE IF NOT EXISTS check_in_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
    consecutive_days INT NOT NULL DEFAULT 0,
    points_earned INT NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS idx_check_in_user_date ON check_in_record (user_id, check_in_date DESC);

-- ============================================================
-- 17. chat_room (聊天室表 — ws-server 用)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_room (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50) DEFAULT 'messages-square',
    description TEXT DEFAULT '',
    member_count INT NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 18. chat_message (聊天消息表 — ws-server 用)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_message (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT DEFAULT NULL,
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT DEFAULT NULL,
    content TEXT NOT NULL,
    msg_type SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_msg_room ON chat_message (room_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_msg_dm ON chat_message (sender_id, receiver_id, created_at);

-- ============================================================
-- 19. sys_oauth_account (OAuth第三方账号绑定)
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_oauth_account (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_user (id),
    provider VARCHAR(20) NOT NULL,
    provider_user_id VARCHAR(100) NOT NULL,
    provider_username VARCHAR(100) DEFAULT '',
    access_token TEXT DEFAULT '',
    refresh_token TEXT DEFAULT '',
    token_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (provider, provider_user_id),
    UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_oauth_account_user ON sys_oauth_account (user_id);