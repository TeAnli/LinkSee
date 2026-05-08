CREATE TABLE IF NOT EXISTS sys_user
(
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    nickname       VARCHAR(50)  NOT NULL DEFAULT '',
    avatar_url     VARCHAR(500)          DEFAULT '',
    email          VARCHAR(100)          DEFAULT '',
    phone          VARCHAR(20)           DEFAULT '',
    level          SMALLINT     NOT NULL DEFAULT 1,
    experience     INT          NOT NULL DEFAULT 0,
    daily_ai_calls INT          NOT NULL DEFAULT 0,
    status         SMALLINT     NOT NULL DEFAULT 1,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted        SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sys_user_username ON sys_user (username);
CREATE INDEX IF NOT EXISTS idx_sys_user_email ON sys_user (email);
CREATE INDEX IF NOT EXISTS idx_sys_user_status ON sys_user (status) WHERE deleted = 0;

CREATE TABLE IF NOT EXISTS sys_user_profile
(
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT      NOT NULL UNIQUE,
    bio              TEXT                 DEFAULT '',
    location         VARCHAR(100)         DEFAULT '',
    personal_website VARCHAR(500)         DEFAULT '',
    social_links     JSONB                DEFAULT '{}',
    skills_tags      JSONB                DEFAULT '[]',
    education        VARCHAR(200)         DEFAULT '',
    occupation       VARCHAR(100)         DEFAULT '',
    is_verified      BOOLEAN     NOT NULL DEFAULT FALSE,
    verify_info      JSONB                DEFAULT '{}',
    follower_count   INT         NOT NULL DEFAULT 0,
    following_count  INT         NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_profile FOREIGN KEY (user_id) REFERENCES sys_user(id)
);

CREATE TABLE IF NOT EXISTS sys_role
(
    id          BIGSERIAL PRIMARY KEY,
    role_code   VARCHAR(50)   NOT NULL UNIQUE,
    role_name   VARCHAR(50)   NOT NULL,
    description VARCHAR(200)          DEFAULT '',
    permissions JSONB                 DEFAULT '[]',
    status      SMALLINT      NOT NULL DEFAULT 1,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted     SMALLINT      NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sys_user_role
(
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES sys_user(id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES sys_role(id)
);

CREATE TABLE IF NOT EXISTS forum_category
(
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(50)   NOT NULL,
    icon          VARCHAR(50)            DEFAULT '',
    parent_id     BIGINT                 DEFAULT NULL,
    description   TEXT                   DEFAULT '',
    sort_order    INT           NOT NULL DEFAULT 0,
    post_count    INT           NOT NULL DEFAULT 0,
    theme_color   VARCHAR(20)            DEFAULT '#1890ff',
    post_template JSONB                  DEFAULT '{}',
    ai_persona    VARCHAR(200)           DEFAULT '专业友好的助手',
    status        SMALLINT      NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted       SMALLINT      NOT NULL DEFAULT 0,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES forum_category(id)
);

CREATE INDEX IF NOT EXISTS idx_forum_category_parent ON forum_category (parent_id) WHERE deleted = 0;

CREATE TABLE IF NOT EXISTS forum_post
(
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT           NOT NULL,
    category_id     BIGINT           NOT NULL,
    title           VARCHAR(200)     NOT NULL,
    content         TEXT             NOT NULL,
    cover_image_url VARCHAR(500)              DEFAULT '',
    summary         TEXT                      DEFAULT '',
    tag_list        JSONB                     DEFAULT '[]',
    view_count      INT              NOT NULL DEFAULT 0,
    like_count      INT              NOT NULL DEFAULT 0,
    comment_count   INT              NOT NULL DEFAULT 0,
    collect_count   INT              NOT NULL DEFAULT 0,
    status          SMALLINT         NOT NULL DEFAULT 0,
    is_top          BOOLEAN          NOT NULL DEFAULT FALSE,
    is_essence      BOOLEAN          NOT NULL DEFAULT FALSE,
    sort_weight     DOUBLE PRECISION NOT NULL DEFAULT 0,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    deleted         SMALLINT         NOT NULL DEFAULT 0,
    CONSTRAINT fk_post_author FOREIGN KEY (author_id) REFERENCES sys_user(id),
    CONSTRAINT fk_post_category FOREIGN KEY (category_id) REFERENCES forum_category(id)
);

CREATE INDEX IF NOT EXISTS idx_forum_post_author ON forum_post (author_id) WHERE deleted = 0 AND status = 1;
CREATE INDEX IF NOT EXISTS idx_forum_post_category ON forum_post (category_id) WHERE deleted = 0 AND status = 1;
CREATE INDEX IF NOT EXISTS idx_forum_post_status ON forum_post (status, created_at DESC) WHERE deleted = 0;
CREATE INDEX IF NOT EXISTS idx_forum_post_hot ON forum_post (sort_weight DESC) WHERE deleted = 0 AND status = 1;
CREATE INDEX IF NOT EXISTS idx_forum_post_published ON forum_post (published_at DESC) WHERE deleted = 0 AND status = 1;

CREATE TABLE IF NOT EXISTS forum_comment
(
    id         BIGSERIAL PRIMARY KEY,
    post_id    BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    parent_id  BIGINT               DEFAULT NULL,
    content    TEXT        NOT NULL,
    like_count INT         NOT NULL DEFAULT 0,
    status     SMALLINT    NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted    SMALLINT    NOT NULL DEFAULT 0,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES forum_post(id),
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES sys_user(id),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES forum_comment(id)
);

CREATE INDEX IF NOT EXISTS idx_forum_comment_post ON forum_comment (post_id, created_at ASC) WHERE deleted = 0 AND status = 1;
CREATE INDEX IF NOT EXISTS idx_forum_comment_parent ON forum_comment (parent_id) WHERE deleted = 0;

CREATE TABLE IF NOT EXISTS forum_like_record
(
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT      NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_id   BIGINT      NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES sys_user(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_like_record_unique ON forum_like_record (user_id, target_type, target_id);

CREATE TABLE IF NOT EXISTS forum_follow
(
    id           BIGSERIAL PRIMARY KEY,
    follower_id  BIGINT      NOT NULL,
    following_id BIGINT      NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES sys_user(id),
    CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES sys_user(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_follow_unique ON forum_follow (follower_id, following_id);

CREATE TABLE IF NOT EXISTS forum_post_ai_data
(
    id                     BIGSERIAL PRIMARY KEY,
    post_id                BIGINT      NOT NULL UNIQUE,
    ai_summary             TEXT                 DEFAULT '',
    ai_keywords            JSONB                DEFAULT '[]',
    sentiment_score        DOUBLE PRECISION     DEFAULT 0,
    quality_score          DOUBLE PRECISION     DEFAULT 0,
    read_duration_estimate INT                  DEFAULT 0,
    vector_id              VARCHAR(100)         DEFAULT '',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_post_ai_data FOREIGN KEY (post_id) REFERENCES forum_post(id)
);

CREATE TABLE IF NOT EXISTS ai_task_record
(
    id             BIGSERIAL PRIMARY KEY,
    user_id        BIGINT      NOT NULL,
    task_type      VARCHAR(30) NOT NULL,
    input_summary  TEXT                 DEFAULT '',
    output_content TEXT,
    model_used     VARCHAR(50) NOT NULL,
    tokens_input   INT                  DEFAULT 0,
    tokens_output  INT                  DEFAULT 0,
    response_ms    INT                  DEFAULT 0,
    status         SMALLINT    NOT NULL DEFAULT 0,
    error_message  TEXT                 DEFAULT '',
    target_type    VARCHAR(20)          DEFAULT '',
    target_id      BIGINT               DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ai_task_user FOREIGN KEY (user_id) REFERENCES sys_user(id)
);

CREATE INDEX IF NOT EXISTS idx_ai_task_user ON ai_task_record (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_task_type ON ai_task_record (task_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_task_status ON ai_task_record (status, created_at DESC);

CREATE TABLE IF NOT EXISTS ai_moderation_log
(
    id               BIGSERIAL PRIMARY KEY,
    content_id       BIGINT      NOT NULL,
    content_type     VARCHAR(20) NOT NULL,
    moderation_result VARCHAR(20) NOT NULL,
    violation_type   VARCHAR(50)         DEFAULT '',
    confidence       DOUBLE PRECISION     DEFAULT 0,
    action_taken     VARCHAR(20) NOT NULL,
    reviewer_id      BIGINT               DEFAULT NULL,
    review_time      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_notice
(
    id          BIGSERIAL PRIMARY KEY,
    notice_type VARCHAR(20)   NOT NULL,
    title       VARCHAR(200)  NOT NULL,
    content     TEXT          NOT NULL,
    receiver_id BIGINT        NOT NULL,
    sender_id   BIGINT                 DEFAULT NULL,
    is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
    target_type VARCHAR(20)            DEFAULT '',
    target_id   BIGINT                 DEFAULT 0,
    extra_data  JSONB                  DEFAULT '{}',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    deleted     SMALLINT      NOT NULL DEFAULT 0,
    CONSTRAINT fk_notice_receiver FOREIGN KEY (receiver_id) REFERENCES sys_user(id)
);

CREATE INDEX IF NOT EXISTS idx_notice_receiver ON message_notice (receiver_id, is_read, created_at DESC) WHERE deleted = 0;

INSERT INTO sys_role (role_code, role_name, description, permissions, status) VALUES
('ROLE_SUPER_ADMIN', '超级管理员', '系统最高权限', '["*"]', 1),
('ROLE_ADMIN', '管理员', '站点管理员', '["user:manage", "post:manage", "category:manage", "moderation:manage"]', 1),
('ROLE_MODERATOR', '版主', '板块版主', '["post:moderate", "comment:moderate"]', 1),
('ROLE_VERIFIED', '认证用户', '专业认证用户', '["ai:qa", "post:create", "comment:create"]', 1),
('ROLE_USER', '普通用户', '普通注册用户', '["post:create", "comment:create", "ai:assist"]', 1)
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO forum_category (name, icon, parent_id, description, sort_order, theme_color, ai_persona) VALUES
('技术研发', '💻', NULL, '技术开发相关讨论', 10, '#1890ff', '专业严谨的技术工程师'),
('人工智能', '🤖', 1, 'AI技术、机器学习、深度学习', 1, '#52c41a', 'AI领域专家'),
('软件开发', '💡', 1, '编程语言、框架、开发实践', 2, '#722ed1', '资深开发者'),
('云原生', '☁', 1, 'Kubernetes、Docker、DevOps', 3, '#13c2c2', '云架构专家'),
('信息安全', '🔒', 1, '网络安全、渗透测试、安全合规', 4, '#f5222d', '安全专家'),
('学术科研', '📚', NULL, '学术研究与科学探索', 20, '#fa8c16', '博学的学者'),
('自然科学', '🔬', 6, '物理、化学、生物、数学', 1, '#eb2f96', '科学家'),
('工程技术', '⚙️', 6, '机械、电子、土木、材料', 2, '#1890ff', '工程师'),
('数据科学', '📊', 6, '统计学、数据分析、可视化', 3, '#52c41a', '数据科学家'),
('职业发展', '💼', NULL, '职场经验与职业规划', 30, '#722ed1', '职业导师'),
('职场经验', '💡', 10, '职场生存、沟通技巧、效率工具', 1, '#1890ff', '职场达人'),
('求职招聘', '🎯', 10, '简历面试、薪资谈判、offer选择', 2, '#52c41a', 'HR专家'),
('创业分享', '🚀', 10, '创业故事、融资经验、团队管理', 3, '#fa8c16', '创业者'),
('创意生活', '🎨', NULL, '创意创作与生活方式', 40, '#eb2f96', '创意达人'),
('内容创作', '✍️', 14, '写作、自媒体、文案策划', 1, '#fa8c16', '写作导师'),
('摄影设计', '📸', 14, '摄影、平面、UI/UX', 2, '#eb2f96', '设计师'),
('LinkSee运营区', '⚙️', NULL, '社区公告与建议', 99, '#1890ff', '社区管理员'),
('公告通知', '📢', 17, '官方公告、更新日志', 1, '#f5222d', '官方发言人'),
('功能建议', '💬', 17, '需求反馈、功能讨论', 2, '#1890ff', '产品经理'),
('问题反馈', '🐛', 17, 'Bug报告、故障排查', 3, '#faad14', '技术支持')
ON CONFLICT (id) DO NOTHING;

SELECT 'Database initialization completed successfully' as result;