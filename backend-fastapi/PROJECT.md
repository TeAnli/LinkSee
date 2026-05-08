# LinkSee FastAPI Backend — 架构文档

## 1. 项目概述

LinkSee FastAPI 后端是一个面向技术社区的 RESTful API 服务，提供用户认证、论坛内容管理、AI 辅助写作、全文搜索、即时通知和管理后台等完整功能。

### 技术栈

| 层级 | 技术选型 |
|------|---------|
| **Web 框架** | FastAPI 0.115+ (ASGI) |
| **服务器** | Uvicorn (standard) |
| **ORM** | SQLAlchemy 2.0+ (async, Declarative 2.0 style) |
| **数据库驱动** | asyncpg (PostgreSQL) |
| **数据库迁移** | Alembic (async mode) |
| **数据校验** | Pydantic v2 + pydantic-settings |
| **认证** | JWT (HS256) + bcrypt (12 rounds) |
| **异步** | Python asyncio (native) |
| **Python** | 3.12+ |
| **包管理** | uv (pyproject.toml) |
| **代码规范** | Ruff (linter) + MyPy (type checker) |
| **测试** | pytest + pytest-asyncio + httpx |

### 与 Spring Boot 版本的关系

项目同时存在 `backend/`（Spring Boot + Kotlin）和 `backend-fastapi/`（FastAPI + Python）两个后端实现。Spring 版本仅完成实体定义和项目脚手架，FastAPI 版本是功能完整的可运行实现，包含 51 个 API 端点、完整的业务逻辑层和测试。

---

## 2. 目录结构

```
backend-fastapi/
├── .env.example              # 环境变量模板
├── .python-version           # Python 3.12
├── pyproject.toml            # 项目元数据与依赖声明
├── alembic.ini               # Alembic 数据库迁移配置
├── alembic/
│   ├── env.py                # 异步 Alembic 运行环境
│   └── versions/
│       └── 001_initial_schema.py  # 初始迁移：14 张表 + 种子数据
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI 应用工厂（CORS、异常处理、路由注册）
│   ├── config.py             # 配置中心（pydantic-settings）
│   ├── constants.py          # 错误码、等级配置、积分、角色常量
│   ├── database.py           # 异步 SQLAlchemy 引擎与会话工厂
│   ├── dependencies.py       # FastAPI 依赖注入（认证、角色、等级守卫）
│   ├── exceptions.py         # 自定义 AppException
│   ├── security.py           # bcrypt 密码哈希 + JWT 签发/解码
│   ├── utils.py              # ok() / fail() 统一响应构建器
│   ├── middleware/
│   │   └── error_handler.py  # 4 个全局异常处理器
│   ├── models/               # SQLAlchemy ORM 模型（14 张表）
│   ├── schemas/               # Pydantic 请求/响应模型
│   ├── services/              # 业务逻辑层
│   └── routers/               # API 路由层（7 个路由模块）
└── tests/
    ├── conftest.py            # pytest 夹具（client, auth_client）
    └── test_auth.py           # 认证模块测试
```

---

## 3. 分层架构

```
┌─────────────────────────────────────────────┐
│                  Routers                     │  ← 路由层：接收 HTTP 请求
│   auth / user / forum / search / ai /       │    校验 Pydantic Schema
│   message / admin                            │    调用 Service
├─────────────────────────────────────────────┤
│                 Services                     │  ← 服务层：业务逻辑
│   auth / user / forum / search /            │    数据库操作
│   ai / ai_mock / message / admin            │    事务编排
├─────────────────────────────────────────────┤
│              Models + Schemas               │  ← 数据层
│   SQLAlchemy ORM (models/)                  │    表映射
│   Pydantic DTO (schemas/)                   │    请求/响应序列化
├─────────────────────────────────────────────┤
│              Infrastructure                  │
│   database.py (async engine/session)        │  ← 基础设施
│   security.py (JWT + bcrypt)                │
│   config.py (Settings)                      │
│   dependencies.py (DI guards)               │
└─────────────────────────────────────────────┘
```

### 3.1 请求生命周期

```
HTTP Request
  │
  ├─ CORS Middleware        ← 跨域校验
  │
  ├─ Router Layer           ← 路径匹配、Pydantic 参数校验
  │   └─ Depends(get_db)    ← 注入异步数据库会话
  │   └─ Depends(get_current_user) ← JWT 解析、用户加载
  │   └─ Depends(require_admin()) ← 角色校验
  │
  ├─ Service Layer          ← 业务逻辑、数据库查询、事务编排
  │
  ├─ Response Builder       ← ok(data) / fail(code, msg)
  │
  └─ Exception Handlers     ← 统一异常 → JSON 错误响应
      ├─ AppException       → 业务异常（自定义 code + status_code）
      ├─ ValidationError    → 422 参数校验失败
      ├─ IntegrityError     → 409 数据冲突（唯一约束）
      └─ Exception          → 500 内部错误
```

### 3.2 统一响应格式

所有 API 返回如下 JSON 结构：

```json
{
  "code": 0,
  "message": "success",
  "data": { ... },
  "timestamp": 1744567890123
}
```

- `code: 0` 表示成功，非零为错误码（见附录 A）
- `timestamp` 为 Unix 毫秒时间戳
- 错误响应不使用 `ok()` 构造，而是通过异常处理器统一构建，包含相同的 fields

---

## 4. 数据库设计

### 4.1 引擎与会话

```python
# app/database.py
engine = create_async_engine(
    settings.database_url,     # postgresql+asyncpg://...
    pool_size=20,              # 连接池大小
    max_overflow=10,           # 最大溢出连接
    pool_recycle=3600,         # 连接回收时间（秒）
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,    # commit 后不使对象过期
)

async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()    # 成功自动提交
        except Exception:
            await session.rollback()  # 异常自动回滚
            raise
```

关键设计：**请求成功自动 commit，异常自动 rollback**。Service 层无需手动管理事务，只需调用 `db.add()` / `db.flush()` 即可。

### 4.2 模型继承体系

```
DeclarativeBase (Base)
  └── TimestampMixin (created_at, updated_at)
        ├── SysUser           ← 独立时间戳（不使用 Mixin）
        ├── SysUserProfile
        ├── SysRole
        ├── ForumCategory     ← 自引用树（parent_id）
        ├── ForumPost
        ├── ForumPostAiData   ← 1:1 扩展表
        ├── ForumComment      ← 自引用嵌套（parent_id）
        ├── ForumLikeRecord   ← 多态 like/collect（target_type + target_id）
        ├── ForumFollow
        ├── AiTaskRecord
        ├── AiModerationLog
        └── MessageNotice
```

### 4.3 ER 关系图

```
sys_user ──1:1── sys_user_profile
sys_user ──M:N── sys_role (via sys_user_role)

forum_category ──自引用── parent/children (树形结构)

forum_post ──N:1── sys_user (author)
forum_post ──N:1── forum_category
forum_post ──1:1── forum_post_ai_data (AI 元数据扩展)

forum_comment ──N:1── forum_post
forum_comment ──N:1── sys_user (author)
forum_comment ──自引用── parent/replies (嵌套评论)

forum_like_record ──N:1── sys_user
forum_like_record ──多态── target_type + target_id → post 或 comment

forum_follow ──N:1── sys_user (follower)
forum_follow ──N:1── sys_user (following)

ai_task_record ──N:1── sys_user
message_notice ──N:1── sys_user (receiver)
message_notice ──N:1── sys_user (sender, nullable)
```

### 4.4 枚举与状态码

```python
# 用户状态
USER_STATUS_DISABLED = 0  # 禁用
USER_STATUS_NORMAL = 1    # 正常
USER_STATUS_MUTED = 2     # 禁言

# 帖子状态
POST_STATUS_DRAFT = 0      # 草稿
POST_STATUS_PUBLISHED = 1  # 已发布
POST_STATUS_REVIEWING = 2  # 审核中
POST_STATUS_VIOLATION = 3  # 违规

# AI 任务状态
AI_TASK_PROCESSING = 0
AI_TASK_SUCCESS = 1
AI_TASK_FAIL = 2
AI_TASK_TIMEOUT = 3
```

### 4.5 数据库迁移（Alembic）

```
alembic/
├── env.py                          ← 异步引擎配置
└── versions/
    └── 001_initial_schema.py       ← 14 张表 + 索引 + FK + 种子数据
```

迁移使用 `run_async_migrations()` 保证与 asyncpg 兼容。种子数据包含 5 个默认角色和 20 个论坛板块分类。

常用命令：

```bash
alembic revision --autogenerate -m "description"   # 自动生成迁移
alembic upgrade head                                # 应用迁移
alembic downgrade -1                                # 回滚一步
```

---

## 5. 认证与授权

### 5.1 认证流程

```
注册: POST /api/auth/register
  ┌─ 校验验证码（GET /api/auth/captcha 获取）
  ├─ bcrypt(12 rounds) 哈希密码
  ├─ 创建 SysUser + SysUserProfile
  └─ 返回 access_token + refresh_token + user info

登录: POST /api/auth/login
  ┌─ 支持 username / email / phone 三种方式
  ├─ bcrypt 验证密码
  ├─ 更新 last_login_at
  └─ 返回 access_token + refresh_token + user info

刷新: POST /api/auth/refresh-token
  ┌─ 验证 refresh_token
  └─ 签发新的 access_token + refresh_token
```

### 5.2 JWT 双 Token 机制

| Token 类型 | 有效期 | 用途 |
|-----------|--------|------|
| `access_token` | 2 小时（可配置） | API 鉴权 |
| `refresh_token` | 7 天（可配置） | 刷新 access_token |

**Payload 结构**：

```json
// access_token
{
  "sub": "42",           // user_id
  "roles": ["ROLE_USER"],
  "exp": 1744654890,
  "type": "access"
}

// refresh_token
{
  "sub": "42",
  "exp": 1745263290,
  "type": "refresh"
}
```

Token 通过 `Authorization: Bearer <token>` 头传递，由 `OAuth2PasswordBearer` 自动提取。

### 5.3 依赖注入守卫链

```
get_current_user            ← 必需登录（token 无效 → 401）
  └── require_roles(*roles) ← 角色校验（无权限 → 403）
  └── require_admin()       ← 管理员校验
  └── require_level(min_lv) ← 等级校验

get_current_user_optional   ← 可选登录（未登录返回 None）
```

角色体系（5 级）：

| 角色 | 编码 | 说明 |
|------|------|------|
| 普通用户 | `ROLE_USER` | 发帖、评论、AI 辅助 |
| 认证用户 | `ROLE_VERIFIED` | + AI 问答 |
| 版主 | `ROLE_MODERATOR` | 审核帖子/评论 |
| 管理员 | `ROLE_ADMIN` | 用户管理、站点配置 |
| 超级管理员 | `ROLE_SUPER_ADMIN` | 全部权限 |

### 5.4 用户等级体系（6 级）

| 等级 | 名称 | 经验要求 | 每日 AI 额度 | 图标 |
|------|------|---------|-------------|------|
| 1 | 萌新小白 | 0 | 3 | 🌱 |
| 2 | 活跃新人 | 100 | 5 | 🌿 |
| 3 | 社区达人 | 500 | 10 | 🌳 |
| 4 | 领域专家 | 2000 | 20 | 🔥 |
| 5 | 灵犀之星 | 5000 | 无限 | ⭐ |
| 6 | 社区领袖 | 10000 | 无限 | 👑 |

---

## 6. API 端点全景

### 6.1 认证模块 (`/api/auth`) — 5 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/captcha` | 获取图形验证码 | 否 |
| `POST` | `/register` | 用户注册 | 否 |
| `POST` | `/login` | 登录（用户名/邮箱/手机号） | 否 |
| `POST` | `/logout` | 登出 | 是 |
| `POST` | `/refresh-token` | 刷新 token | 否 |

### 6.2 用户模块 (`/api/user`) — 9 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/profile` | 获取个人资料 | 是 |
| `PUT` | `/profile` | 更新个人资料 | 是 |
| `POST` | `/avatar` | 上传头像 | 是 |
| `GET` | `/check-in` | 每日签到 | 是 |
| `GET` | `/followers` | 我的粉丝列表 | 是 |
| `GET` | `/followings` | 我的关注列表 | 是 |
| `GET` | `/rankings` | 用户排行榜 | 否 |
| `GET` | `/{user_id}/profile` | 查看他人公开资料 | 可选 |
| `GET` | `/{user_id}/posts` | 查看他人帖子 | 否 |

### 6.3 论坛模块 (`/api/forum`) — 15 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/categories` | 分类树（含统计） | 否 |
| `GET` | `/category/{id}` | 分类详情（置顶+精华） | 否 |
| `GET` | `/posts` | 帖子列表（筛选/排序/分页） | 否 |
| `GET` | `/post/{id}` | 帖子详情（含作者/AI 数据） | 可选 |
| `POST` | `/post` | 发帖 | 是 |
| `PUT` | `/post/{id}` | 编辑帖子 | 是（作者） |
| `DELETE` | `/post/{id}` | 删除帖子（软删除） | 是（作者） |
| `GET` | `/post/{id}/comments` | 评论列表（嵌套树） | 可选 |
| `POST` | `/post/{id}/comment` | 发表评论 | 是 |
| `DELETE` | `/comment/{id}` | 删除评论 | 是（作者） |
| `POST` | `/post/{id}/like` | 点赞/取消点赞 | 是 |
| `POST` | `/post/{id}/collect` | 收藏/取消收藏 | 是 |
| `POST` | `/user/{id}/follow` | 关注/取消关注 | 是 |
| `GET` | `/user/favorites` | 我的收藏列表 | 是 |

**排序方式**：`hot`（综合热度权重）、`latest`（最新发布）、`essence`（精华优先）

### 6.4 搜索模块 (`/api/search`) — 3 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/` | 全文搜索（标题+摘要） | 否 |
| `GET` | `/hot` | 热门搜索词 | 否 |
| `GET` | `/suggest` | 搜索建议/自动补全 | 否 |

### 6.5 AI 模块 (`/api/ai`) — 15 端点

**创作辅助（8 个）**：

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/create/title-generate` | 标题生成（5 种风格） |
| `POST` | `/create/outline-assist` | 大纲辅助 |
| `POST` | `/create/polish-optimize` | 文本润色 |
| `POST` | `/create/continue-write` | 续写（4 种模式） |
| `POST` | `/create/translate` | 翻译 |
| `POST` | `/create/summary-extract` | 摘要提取 |
| `POST` | `/create/tag-recommend` | 标签推荐 |
| `POST` | `/create/inspire` | 写作灵感 |

**AI 问答（4 个）**：

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/chat/send` | 发送消息（支持 SSE 流式） |
| `GET` | `/chat/sessions` | 历史会话列表 |
| `GET` | `/chat/session/{id}/messages` | 会话消息记录 |
| `DELETE` | `/chat/session/{id}` | 删除会话 |

**配额与反馈（2 个）**：

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/usage/quota` | 查询 AI 使用额度 |
| `POST` | `/chat/feedback` | 提交回答反馈 |

**流式响应 (SSE)**：`chat/send` 在 `stream=true` 时返回 `text/event-stream`，事件类型包括 `thinking`（思考过程）、`sources`（引用来源）、`content`（回答内容）、`followups`（追问建议）、`done`（完成标记）。

### 6.6 消息模块 (`/api/message`) — 4 端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/notifications` | 通知列表（分页） | 是 |
| `PUT` | `/{notice_id}/read` | 标记单条已读 | 是 |
| `PUT` | `/read-all` | 全部标记已读 | 是 |
| `GET` | `/unread-count` | 未读数量（按类型） | 是 |

### 6.7 管理后台 (`/api/admin`) — 12 端点

所有端点需要 `ROLE_ADMIN` 或 `ROLE_SUPER_ADMIN` 角色。

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/dashboard` | 仪表盘概览（7 日趋势） |
| `GET` | `/users` | 用户列表（含筛选） |
| `PUT` | `/users/{id}/status` | 更新用户状态 |
| `PUT` | `/users/{id}/roles` | 更新用户角色 |
| `GET` | `/posts` | 帖子管理列表 |
| `POST` | `/posts/{id}/moderate` | 审核帖子 |
| `PUT` | `/posts/{id}/feature` | 设置置顶/精华 |
| `POST` | `/categories` | 创建分类 |
| `PUT` | `/categories/{id}` | 更新分类 |
| `DELETE` | `/categories/{id}` | 删除分类 |
| `GET` | `/ai/usage/stats` | AI 用量统计 |
| `GET` | `/ai/tasks` | AI 任务日志 |

---

## 7. AI 子系统设计

### 7.1 架构概览

```
Router (ai.py)
  │
  ├─ check_quota(user)      ← 验证每日额度
  ├─ ai_mock.mock_xxx(...)  ← 生成回复（当前为 Mock）
  ├─ record_task(...)       ← 记录任务审计日志
  └─ consume_quota(...)     ← 扣减额度
```

### 7.2 额度系统

每次 AI 调用前校验当日剩余额度：

```
daily_remaining = LEVEL_CONFIG[user.level]["daily_ai"] - user.daily_ai_calls
```

- Lv1~4 有每日使用上限，Lv5~6 无限额
- 自动记录每次调用的 task_type、输入摘要、输出内容、模型、token 数
- 可通过管理后台查看 AI 使用统计

### 7.3 Mock 模式

当前 AI 功能使用 `ai_mock.py` 提供模拟响应。通过配置 `AI_MOCK_ENABLED=true` 控制。

Mock 提供：
- **标题生成**：5 种风格（academic/trendy/question/howto/controversal）
- **大纲辅助**：3 级详细程度
- **文本续写**：4 种模式（detail/summary/example/counterargument）
- **SSE 流式对话**：完整模拟 thinking → sources → content → followups → done 事件流

### 7.4 对接真实 AI 的扩展点

在 `app/services/ai_service.py` 中替换 mock 调用即可：

```python
# 当前
data = ai_mock.mock_title_generate(req.content, req.style)

# 对接真实 API（示例）
data = await openai_client.title_generate(req.content, req.style)
```

`AiTaskRecord` 表已预留 `model_used`、`tokens_input`、`tokens_output`、`response_ms` 字段用于记录真实调用数据。

---

## 8. 配置管理

### 8.1 配置加载

```
.env → pydantic-settings → app.config.settings (全局单例)
```

```python
# app/config.py
class Settings(BaseSettings):
    app_name: str = "LinkSee API"
    debug: bool = False
    database_url: str = "postgresql+asyncpg://..."
    jwt_secret: str = "change-me-in-production-..."
    jwt_expiration_seconds: int = 7200        # 2h
    jwt_refresh_expiration_seconds: int = 604800  # 7d
    redis_url: str = "redis://localhost:6379/0"
    upload_dir: str = "./uploads"
    max_upload_size: int = 5 * 1024 * 1024    # 5MB
    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    ai_mock_enabled: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}
```

### 8.2 环境变量清单

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql+asyncpg://linksee:linksee123@localhost:5432/linksee` |
| `JWT_SECRET` | JWT 签名密钥 | 内置换开发用默认值 |
| `JWT_EXPIRATION_SECONDS` | access token 过期秒数 | `7200` |
| `JWT_REFRESH_EXPIRATION_SECONDS` | refresh token 过期秒数 | `604800` |
| `REDIS_URL` | Redis 连接（预留） | `redis://localhost:6379/0` |
| `ALLOWED_ORIGINS` | CORS 允许源（逗号分隔） | `http://localhost:5173,http://localhost:3000` |
| `UPLOAD_DIR` | 文件上传目录 | `./uploads` |
| `AI_MOCK_ENABLED` | AI Mock 开关 | `true` |

---

## 9. 错误处理机制

### 9.1 异常层级

```
FastAPI RequestValidationError  →  422, code=40000
SQLAlchemy IntegrityError        →  409, code=40001~40003 (按约束名分发)
AppException(code, msg, status)  →  status, code=传入值
Exception (兜底)                 →  500, code=50000
```

### 9.2 完整错误码表

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| `0` | 200 | 成功 |
| `40000` | 400/422 | 请求参数错误 |
| `40001` | 409 | 用户名已存在 |
| `40002` | 409 | 邮箱已注册 |
| `40003` | 409 | 手机号已注册 |
| `40004` | 400 | 验证码错误/过期 |
| `40010` | 404 | 用户不存在 |
| `40011` | 401 | 密码错误 |
| `40012` | 403 | 账号已禁用 |
| `40013` | 400 | 验证码错误 |
| `40014` | 403 | 账号已锁定 |
| `40020` | 401 | refresh token 无效 |
| `40021` | 401 | refresh token 已过期 |
| `40100` | 401 | 未登录 |
| `40101` | 400 | 今日已签到 |
| `40102` | 403 | 权限不足 |
| `40103` | 403 | 账号异常（被禁言） |
| `40201` | 404 | 板块不存在 |
| `40202` | 400 | 内容违规 |
| `40203` | 429 | 发帖频率限制 |
| `40210` | 403 | 无权编辑/删除 |
| `40211` | 404 | 帖子不存在 |
| `40301` | 429 | AI 额度已用完 |
| `40302` | 503 | AI 服务不可用 |
| `40303` | 403 | 等级不足 |
| `40401` | 404 | 资源不存在（通用） |
| `50000` | 500 | 服务器内部错误 |
| `50001` | 504 | 第三方服务超时 |
| `50002` | 503 | 第三方服务不可用 |

### 9.3 IntegrityError 解析

`error_handler.py` 通过解析 PostgreSQL 错误消息中的约束名，自动匹配到对应的业务错误码：

```
"unique constraint 'sys_user_username_key'" → 40001 用户名已存在
"duplicate key ... email"                   → 40002 邮箱已注册
"duplicate key ... phone"                   → 40003 手机号已注册
```

---

## 10. 积分系统

用户通过社区行为获取经验值，经验值决定等级和 AI 使用额。

| 行为 | 积分 |
|------|------|
| 发帖 | +10 |
| 评论 | +2 |
| 点赞他人 | +1 |
| 被点赞 | +3 |
| 每日签到 | +5 |
| 帖子上精华 | +20 |
| 帖子置顶 | +50 |
| 回答被采纳 | +15 |
| 举报属实 | +2 |
| 连续 7 天签到 | +30 |
| 首次获精华 | +50 |
| 100 粉丝里程碑 | +100 |
| 帖子被删 | -20 |
| 评论被举报 | -5 |

---

## 11. 分页规范

所有列表接口统一使用 `page` + `size` 分页参数，返回统一的 `PageResponse` 结构：

```json
{
  "code": 0,
  "data": {
    "total": 156,
    "page": 1,
    "size": 20,
    "hasMore": true,
    "list": [...]
  }
}
```

- `page`: 从 1 开始，最小值 1
- `size`: 每页条数，默认 20，最大 100
- `hasMore`: `(page * size) < total`

---

## 12. 测试

### 12.1 测试基础设施

```python
# tests/conftest.py
@pytest.fixture
async def client():
    # httpx.AsyncClient，app 级生命周期

@pytest.fixture
async def auth_client(client):
    # 自动注册 + 登录，返回带 Bearer token 的 client
```

### 12.2 当前测试覆盖（`tests/test_auth.py`）

| 测试 | 说明 |
|------|------|
| `test_get_captcha` | 验证码接口返回 image/svg+xml |
| `test_register_success` | 正常注册流程 |
| `test_login_success` | 正常登录流程（username/password） |
| `test_unauthorized_access` | 未登录访问需认证接口 → 401 |

### 12.3 运行测试

```bash
pytest                          # 运行全部
pytest tests/test_auth.py -v    # 详细输出
pytest -k "test_register"       # 按名称过滤
```

---

## 13. 开发工作流

### 13.1 环境搭建

```bash
# 1. 安装依赖
uv sync

# 2. 复制环境变量
cp .env.example .env
# 编辑 .env 填写实际配置

# 3. 确保 PostgreSQL 运行，创建数据库
createdb linksee

# 4. 运行数据库迁移
alembic upgrade head

# 5. 启动开发服务器
uvicorn app.main:app --reload --port 8080

# 6. 访问 API 文档
# Swagger UI: http://localhost:8080/docs
# ReDoc:      http://localhost:8080/redoc
```

### 13.2 代码质量

```bash
ruff check .           # Lint 检查
ruff format .          # 代码格式化
mypy app/              # 类型检查
```

### 13.3 数据库迁移

```bash
# 修改 models/ 中的 ORM 模型后
alembic revision --autogenerate -m "add_xxx_table"

# 检查生成的迁移文件，确认无误后
alembic upgrade head

# 回滚
alembic downgrade -1
```

---

## 14. 架构决策记录

### ADR-1: 为什么选择 async/await 全异步

- PostgreSQL 驱动 `asyncpg` 性能远超同步驱动
- FastAPI 原生 async 支持，无额外适配成本
- `get_db()` 使用 `async with` 自动管理事务，代码简洁

### ADR-2: 为什么不使用 Repository 模式

- 项目规模适中，SQLAlchemy 2.0 `select()` API 已足够声明式
- Service 层直接使用 `AsyncSession`，避免过度抽象
- 复杂查询（如论坛搜索、管理后台聚合）难以用通用 Repository 抽象

### ADR-3: 为什么 AI 使用 Mock 而不是直接对接 API

- 开发阶段无需真实的 AI API key
- Mock 提供可预测的响应用于前端并行开发
- `ai_mock.py` 与 `ai_service.py` 分离，替换为真实 API 只需修改 import

### ADR-4: 为什么 ForumLikeRecord 使用 target_type + target_id 多态

- 点赞/收藏的目标可以是 Post 或 Comment
- target_type 字段区分目标类型，避免两张独立的点赞表
- 配合唯一索引 `(user_id, target_type, target_id)` 防止重复操作

### ADR-5: 为什么使用双 Token（access + refresh）

- access_token 短有效期（2h）降低泄露风险
- refresh_token 长有效期（7d）避免频繁登录
- 职责分离：access 含 roles 信息，refresh 仅含 user_id

---

## 附录 A: 文件职责速查

| 文件 | 职责 |
|------|------|
| `main.py` | FastAPI app 工厂，中间件/CORS/异常处理器/路由注册 |
| `config.py` | Settings 单例，从 .env 加载 |
| `database.py` | async engine + async_session + get_db 生成器 |
| `dependencies.py` | get_current_user / require_roles / require_admin / require_level |
| `security.py` | hash_password / verify_password / JWT 签发与解码 |
| `exceptions.py` | AppException(code, message, status_code) |
| `utils.py` | ok(data, msg) / fail(code, msg) 统一响应 |
| `constants.py` | 错误码 / 等级经验表 / 状态枚举 / 积分值 / 角色码 |
| `middleware/error_handler.py` | 4 个全局异常 → JSON 响应转换器 |
| `models/base.py` | DeclarativeBase + TimestampMixin |
| `models/*.py` | 14 张表的 ORM 映射 |
| `schemas/common.py` | ApiResponse / PageResponse / PageParams / UserBriefInfo |
| `schemas/*.py` | Pydantic 请求/响应 DTO |
| `services/auth_service.py` | 注册、登录、token 刷新、验证码 |
| `services/user_service.py` | 个人资料 CRUD、关注关系、排行榜、签到 |
| `services/forum_service.py` | 分类树、帖子 CRUD、评论嵌套、点赞/收藏/关注切换 |
| `services/search_service.py` | 全文搜索、热门关键词、自动补全 |
| `services/ai_service.py` | 额度检查/消费、任务记录、配额查询 |
| `services/ai_mock.py` | 8 种 AI 创作 + SSE 流式对话的 Mock 实现 |
| `services/message_service.py` | 通知列表、标记已读、未读计数 |
| `services/admin_service.py` | 仪表盘、用户/帖子/分类管理、AI 统计 |
| `routers/auth.py` | 5 端点 |
| `routers/user.py` | 9 端点 |
| `routers/forum.py` | 15 端点 |
| `routers/search.py` | 3 端点 |
| `routers/ai.py` | 15 端点 |
| `routers/message.py` | 4 端点 |
| `routers/admin.py` | 12 端点 |
| `tests/conftest.py` | pytest fixtures |
| `tests/test_auth.py` | 认证测试 |
