<div align="center">

# LinkSee

> 面向技术社区的 RESTful API 服务 — 用户认证、论坛内容管理、AI 辅助写作、全文搜索与即时通知

![GitHub Stars](https://img.shields.io/github/stars/TeAnli/LinkSee?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-asyncpg-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT%2Bbcrypt-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

[![Star History Chart](https://api.star-history.com/svg?repos=TeAnli/LinkSee&type=Date)](https://star-history.com/#TeAnli/LinkSee&Date)

</div>

## 设计理念

LinkSee 采用 **Router → Service → Model** 三层架构，各层职责清晰分离：

- **Router 层**：接请求、校验 Pydantic Schema、调用 Service，不写业务逻辑
- **Service 层**：业务编排，直接使用 SQLAlchemy 2.0 `select()` API 操作数据库，不引入 Repository 抽象
- **Model 层**：14 张表的 ORM 映射，通过 Alembic 管理迁移

事务由 `get_db()` 依赖自动管理 —— 请求成功自动 commit，异常自动 rollback，Service 层无需手动控制事务边界。所有响应经 `ok()` / `fail()` 统一封装为 `{code, message, data, timestamp}` 格式。

> 详细架构决策记录见 [PROJECT.md](./PROJECT.md)

## 快速开始

### 前置条件

- Python 3.12+
- PostgreSQL 运行中

### 安装 & 启动

```bash
# 1. 安装依赖
uv sync

# 2. 配置环境变量
cp .env.example .env

# 3. 创建数据库并运行迁移
createdb linksee
alembic upgrade head

# 4. 启动开发服务器
uvicorn app.main:app --reload --port 8080
```

启动后访问 [Swagger UI](http://localhost:8080/docs) 或 [ReDoc](http://localhost:8080/redoc) 浏览全部 API。

### 运行测试

```bash
pytest -v
```

## API 概览

**51 个端点**，7 个路由模块，统一响应格式：

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1744567890123
}
```

| 模块 | 前缀 | 端点数 | 说明 |
|------|------|--------|------|
| Auth | `/api/auth` | 5 | 注册、登录、Token 刷新、图形验证码 |
| User | `/api/user` | 9 | 个人资料、每日签到、排行榜、关注关系 |
| Forum | `/api/forum` | 15 | 帖子 CRUD、嵌套评论、点赞/收藏/关注 |
| Search | `/api/search` | 3 | 全文搜索、热门关键词、搜索建议 |
| AI | `/api/ai` | 15 | AI 写作辅助（8 种）、SSE 流式问答、配额管理 |
| Message | `/api/message` | 4 | 通知列表、标记已读、未读计数 |
| Admin | `/api/admin` | 12 | 仪表盘、用户/帖子/分类管理、AI 统计 |

### 认证

- JWT 双 Token：Access Token 2h + Refresh Token 7d
- 请求头 `Authorization: Bearer <access_token>`
- 5 级角色（普通用户 → 超级管理员）+ 6 级用户等级（萌新小白 → 社区领袖）
- 用户等级决定每日 AI 调用额度

### 分页

列表接口统一使用 `page` + `size` 查询参数，返回 `{total, page, size, hasMore, list}` 结构。

## AI 功能

当前 AI 模块以 Mock 模式运行（`AI_MOCK_ENABLED=true`），返回模拟数据，方便前端独立开发。对接真实 AI API 只需替换 `services/ai_mock.py` 为实际调用，`services/ai_service.py` 已预留 `model_used`、`tokens_input`、`tokens_output`、`response_ms` 记录字段。

| 类别 | 能力 |
|------|------|
| 创作辅助 | 标题生成、大纲辅助、文本润色、续写、翻译、摘要提取、标签推荐、写作灵感 |
| AI 问答 | 支持 SSE 流式对话（`stream=true`），含思考过程、引用来源、追问建议 |
| 配额 | 按用户等级限制每日调用次数，自动扣减并记录审计日志 |

## 项目结构

```
backend-fastapi/
├── app/
│   ├── main.py              # FastAPI 应用入口 (CORS、异常处理、静态文件)
│   ├── config.py            # 配置中心 (pydantic-settings)
│   ├── database.py          # 异步数据库引擎与会话工厂
│   ├── security.py          # bcrypt 密码哈希 + JWT 签发/解码
│   ├── dependencies.py      # 依赖注入守卫 (认证/角色/等级)
│   ├── exceptions.py        # AppException(HTTPException 子类)
│   ├── utils.py             # ok() / fail() 统一响应构建器
│   ├── constants.py         # 错误码、等级经验表、积分值、状态枚举
│   ├── middleware/           # 全局异常处理器 (4 个 handler)
│   ├── models/              # SQLAlchemy ORM 模型 (14 张表)
│   ├── schemas/             # Pydantic v2 请求/响应模型
│   ├── services/            # 业务逻辑层 (8 个服务模块)
│   └── routers/             # API 路由 (7 个路由模块)
├── alembic/                 # 数据库迁移 (异步模式)
├── tests/                   # pytest + httpx
├── pyproject.toml
└── .env.example
```

## 贡献者

[![Contributors](https://contrib.rocks/image?repo=TeAnli/LinkSee)](https://github.com/TeAnli/LinkSee/graphs/contributors)

## 工具链

![VS Code](https://img.shields.io/badge/Editor-VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white)
![uv](https://img.shields.io/badge/pkg-uv-261230?style=flat-square&logo=python&logoColor=white)
![Git](https://img.shields.io/badge/VCS-Git-F05032?style=flat-square&logo=git&logoColor=white)
![Ruff](https://img.shields.io/badge/Lint-Ruff-261230?style=flat-square&logo=ruff&logoColor=white)
![MyPy](https://img.shields.io/badge/Type-MyPy-2A6D96?style=flat-square&logo=python&logoColor=white)
![pytest](https://img.shields.io/badge/Test-pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white)
![Alembic](https://img.shields.io/badge/Migration-Alembic-6E4C1E?style=flat-square&logo=sqlalchemy&logoColor=white)
