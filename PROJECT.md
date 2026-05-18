# LinkSee 灵犀 — AI赋能垂直行业智能论坛系统

> **"心有灵犀，AI懂你"**
>
> 新一代AI驱动的专业知识社区平台 —— 让每一个专业问题都有答案，让每一次创作都有灵感

---

## 目录

- [一、产品概述](#一产品概述)
  - [1.1 项目愿景与定位](#11-项目愿景与定位)
  - [1.2 核心价值主张](#12-核心价值主张)
  - [1.3 目标用户画像](#13-目标用户画像)
- [二、核心技术架构](#二核心技术架构)
  - [2.1 技术栈总览](#21-技术栈总览)
  - [2.2 微服务整体架构](#22-微服务整体架构)
  - [2.3 微服务拆分清单](#23-微服务拆分清单)
  - [2.4 数据存储分层分工](#24-数据存储分层分工)
- [三、网关统一路由规范](#三网关统一路由规范)
  - [3.1 路由设计总则](#31-路由设计总则)
  - [3.2 网关路由前缀映射表](#32-网关路由前缀映射表)
- [四、多板块垂直行业体系](#四多板块垂直行业体系)
  - [4.1 板块体系架构](#41-板块体系架构)
  - [4.2 板块特色配置](#42-板块特色配置)
- [五、用户体系与权限架构](#五用户体系与权限架构)
  - [5.1 用户角色层级](#51-用户角色层级)
  - [5.2 用户等级成长体系](#52-用户等级成长体系)
  - [5.3 积分获取规则](#53-积分获取规则)
- [六、AI双引擎功能设计](#六ai双引擎功能设计)
  - [6.1 AI创作助手引擎](#61-ai创作助手引擎)
  - [6.2 AI智能问答引擎(RAG)](#62-ai智能问答引擎rag)
  - [6.3 多模型适配层架构](#63-多模型适配层架构)
  - [6.4 AI用量控制策略](#64-ai用量控制策略)
- [七、核心业务流程](#七核心业务流程)
  - [7.1 发帖主流程](#71-发帖主流程)
  - [7.2 搜索主流程](#72-搜索主流程)
  - [7.3 AI赋能流程](#73-ai赋能流程)
  - [7.4 缓存交互流程](#74-缓存交互流程)
- [八、前端页面结构](#八前端页面结构)
  - [8.1 页面路由规划](#81-页面路由规划)
  - [8.2 核心页面说明](#82-核心页面说明)
- [九、数据模型设计](#九数据模型设计)
  - [9.1 设计原则](#91-设计原则)
  - [9.2 核心数据表清单](#92-核心数据表清单)
  - [9.3 扩展数据表设计](#93-扩展数据表设计)
- [十、中间件设计规范](#十中间件设计规范)
  - [10.1 Redis缓存Key标准化](#101-redis缓存key标准化)
  - [10.2 Elasticsearch索引结构](#102-elasticsearch索引结构)
  - [10.3 RabbitMQ消息队列设计](#103-rabbitmq消息队列设计)
- [十一、核心API接口设计](#十一核心api接口设计)
  - [11.1 认证接口](#111-认证接口)
  - [11.2 论坛业务接口](#112-论坛业务接口)
  - [11.3 AI能力接口](#113-ai能力接口)
  - [11.4 用户接口](#114-用户接口)
  - [11.5 消息通知接口](#115-消息通知接口)
- [十二、后端工程目录结构](#十二后端工程目录结构)
- [十三、安全与风控](#十三安全与风控)
- [十四、分阶段迭代路线图](#十四分阶段迭代路线图)
- [十五、商业化预留](#十五商业化预留)
- [附录](#附录)

---

## 一、产品概述

### 1.1 项目愿景与定位

LinkSee（灵犀）是一个 **AI赋能的垂直行业智能论坛分布式微服务系统**。它不是传统的泛论坛平台，而是融合了 **AI创作助手** 和 **RAG智能知识库问答** 双引擎的新一代专业社区。

核心理念取自李商隐诗句「身无彩凤双飞翼，心有灵犀一点通」—— 寓意 **AI能够真正理解用户意图，精准连接人与知识**。

**产品形态**：Web端优先，响应式适配移动端，未来可扩展为移动App和小程序。

**运营阶段**：第一阶段聚焦社区运营和用户体验打磨，积累用户和优质内容；暂不考虑变现，后续可根据数据再引入会员/广告/企业服务等商业模式。

### 1.2 核心价值主张

| 维度 | 价值承诺 | 对应功能 |
|------|----------|----------|
| **创作提效** | "10分钟写出专业帖子" | AI标题生成、大纲辅助、智能润色、续写扩写、多语言翻译 |
| **知识获取** | "一个问题，精准答案" | AI对话式问答、RAG检索增强生成、专家匹配推荐 |
| **社区连接** | "找到懂你的人" | 多板块垂直分类、兴趣标签匹配、用户画像相似度推荐 |
| **专业深度** | "每个板块都是知识库" | 行业知识沉淀、AI摘要归档、精华聚合、结构化发帖模板 |

### 1.3 目标用户画像

```
👤 主要用户：25-40岁专业人士/行业从业者
   - 在特定领域有专业知识和实践经验
   - 需要高效获取权威信息和解决方案
   - 希望分享经验但可能写作能力有限
   - 愿意为高质量内容和高效工具停留并贡献内容

👥 次要用户：行业新手/大学生/研究生
   - 需要快速学习专业领域知识
   - 寻求导师指导和职业发展建议
   - 是社区的活跃参与者和内容消费者
   - 可能成为未来的内容创作者

👁️ 潜在用户：企业团队/机构组织
   - 需要内部知识管理和协作平台（V2.0企业版方向）
   - 可能以付费方式使用高级功能
```

---

## 二、核心技术架构

### 2.1 技术栈总览

| 技术层级 | 选定技术组件 | 核心用途 | 技术优势 |
|----------|-------------|----------|----------|
| 开发语言 | **Kotlin** | 后端唯一主力开发语言 | 空安全、函数式编程、杜绝NPE、代码量比Java减少30% |
| 微服务框架 | **Spring Boot 4.0 + Spring Cloud** | 微服务工程搭建、服务治理 | 云原生适配、自动运维扩容、治理标准化 |
| ORM框架 | **Jimmer** | PostgreSQL数据持久化 | 动态SQL、强类型实体、无需XML、开发效率翻倍 |
| 核心数据库 | **PostgreSQL 16（主从）** | 全量核心业务结构化数据存储 | 事务强一致、JSONB扩展字段、复杂查询支持 |
| 分布式缓存 | **Redis 7.0集群** | 热点缓存、会话、计数器、限流 | 毫秒级响应、冷热数据分离 |
| 检索引擎 | **Elasticsearch 8.x集群** | 全站全文检索、关键词热搜 | 海量数据毫秒级返回 |
| 向量数据库 | **Milvus** | 向量语义检索、个性化推荐 | 关键词+语义双引擎 |
| 消息队列 | **RabbitMQ** | 异步削峰、事件驱动解耦 | 不阻塞主流程、高并发平稳 |
| AI大模型 | **智谱GLM-4 + 通义千问 + Kimi（月之暗面）** | AI创作、问答、审核、摘要 | 国产模型合规性好、响应快、成本可控 |
| 实时通信 | **纯 WebSocket (Spring WebFlux Reactive)** | 聊天室群聊、用户私聊、在线状态 | 全双工低延迟、单机十万级并发、心跳保活 |
| 前端技术栈 | **React 19 + TypeScript + Vite 6 + Tailwind CSS 4** | 前端应用开发 | 现代化生态、类型安全、极致开发体验、响应式设计 |

### 2.2 微服务整体架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                          客户端层                                    │
│                    Web (React 19) / 移动端H5 / 小程序(V2)            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      接入层 (CDN + 负载均衡)                         │
│                         Nginx + CDN                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    网关层 (Spring Cloud Gateway)                     │
│              api-gateway — 统一入口、鉴权、限流、日志                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│  auth-service │          │  user-service │          │ forum-service │
│  认证权限服务 │          │  用户信息服务  │          │  论坛核心服务  │
└───────────────┘          └───────────────┘          └───────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────────────┐          ┌───────────────┐
│   ai-service  │          │  ws-server (WebFlux)  │          │message-service│
│ AI智能赋能服务│          │   WebSocket 实时聊天   │          │  消息通知服务  │
└───────────────┘          └───────────────────────┘          └───────────────┘
                                    │
        ┌───────────┬───────────────┼───────────────┬───────────────┐
        ▼           ▼               ▼               ▼               ▼
┌───────────┐ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
│ PostgreSQL │ │   Redis   │  │     ES    │  │  Milvus   │  │  RabbitMQ │
│  (主从)    │ │  (集群)   │  │  (集群)   │  │ (向量库)  │  │  (集群)   │
└───────────┘ └───────────┘  └───────────┘  └───────────┘  └───────────┘
```

**设计原则**：
- 每层只做单一职责，互不越权，扩容互不影响
- 所有外部请求必须经过网关，禁止直连微服务
- 中间件层支撑异步解耦和高性能查询

### 2.3 微服务拆分清单

| 微服务名称 | 服务标识名 | 核心负责业务边界 | 依赖中间件 | 是否对外暴露 |
|------------|-----------|------------------|-----------|:----------:|
| **网关统一入口服务** | `api-gateway` | 路由转发、认证鉴权、限流防刷、跨域处理、灰度发布、全局请求日志 | Redis（限流缓存） | ✅ 唯一对外入口 |
| **认证权限微服务** | `auth-service` | 用户注册、登录、令牌下发(JWT)、角色权限校验、账号安全管控、第三方登录预留 | PostgreSQL、Redis | ❌ 内部调用 |
| **用户信息微服务** | `user-service` | 用户资料、积分等级、兴趣标签、关注粉丝、AI用户画像构建与维护 | PostgreSQL、Redis、Milvus、RabbitMQ | ❌ 内部调用 |
| **论坛核心业务微服务** | `forum-service` | 帖子发布编辑、评论互动、分类标签管理、点赞收藏、板块管理 | PostgreSQL、Redis、RabbitMQ、Elasticsearch | ❌ 内部调用 |
| **AI智能赋能微服务** | `ai-service` | AI创作辅助(8大功能)、AI内容审核、AI摘要生成、AI语义检索(RAG)、AI个性化推荐、多模型调度 | Elasticsearch、Milvus、RabbitMQ、大模型API | ❌ 内部调用 |
| **消息通知微服务** | `message-service` | 站内信、点赞评论提醒、系统通知、AI推送消息统一下发、邮件/短信预留 | PostgreSQL、Redis、RabbitMQ | ❌ 内部调用 |
| **实时聊天微服务** | `ws-server` | WebSocket 实时通信、聊天室群聊广播、用户私聊转发、在线状态追踪、心跳保活 | PostgreSQL、Redis | ❌ 内部调用 |

### 2.4 数据存储分层分工

| 存储组件 | 存储数据类型 | 写入操作归属 | 查询操作归属 | 设计原则 |
|----------|-------------|-------------|-------------|----------|
| **PostgreSQL主库** | 全量核心业务结构化数据（用户、帖子、评论、权限、日志） | Jimmer统一写入(CRUD) | 只做持久落地，不负责高频查询 | 主库保障事务安全可靠 |
| **PostgreSQL从库** | 同主库全量数据，只读副本 | 无写入（主库自动同步） | Jimmer自动走读库，普通业务查询 | 读写分离减轻主库压力 |
| **Redis集群** | 热点帖子列表、用户会话Token、权限缓存、点赞计数器、限流计数、临时数据 | 业务逻辑写入，同步更新缓存 | 高频访问优先读缓存，缓存未命中再查从库 | 冷热数据分离，毫秒级响应 |
| **Elasticsearch集群** | 帖子标题、正文、标签、AI摘要、搜索索引数据 | 发帖/编辑后通过MQ异步同步写入索引 | 全站搜索、AI语义检索前置过滤专用 | 只做检索排序，不承载事务数据 |
| **Milvus向量库** | 帖子内容向量Embedding、用户兴趣画像向量 | AI服务异步计算后写入 | AI相似度匹配、个性化推荐查询 | 只做AI语义计算匹配 |

### 2.5 前端技术架构详细设计

前端采用 **Monorepo** 架构（pnpm workspace），将通用逻辑、UI组件与业务应用解耦。

| 模块/层次 | 技术实现 | 说明 |
|----------|---------|------|
| **基础框架** | React 19 + TypeScript | 利用 React 19 新特性（如 Action、Optimistic UI）提升体验 |
| **构建工具** | Vite 6 + Tailwind CSS 4 | 极速热更新，零运行时 CSS，支持现代浏览器特性 |
| **状态管理** | Zustand 5 | 轻量级、无模板代码的状态管理，支持持久化（Persist） |
| **数据请求** | TanStack Query v5 + Axios | 强大的缓存机制、自动重试、SWR（Stale-While-Revalidate） |
| **实时通信** | 原生 WebSocket + 自定义 Hook (`useWebSocket`) | 聊天室群聊、用户私聊、在线状态、断线重连 |
| **组件库** | shadcn/ui + Radix UI | 基于可访问性标准（A11y）的无样式组件，高度可定制 |
| **路由管理** | React Router 7 | 统一的路由定义，支持嵌套路由与 Layout 布局隔离 |
| **表单校验** | React Hook Form + Zod | 强类型的表单定义与实时校验 |
| **动画效果** | Framer Motion | 流畅的页面过渡与交互动画 |

**前端目录组织规范**：
- `apps/web`: 主 Web 应用程序
- `packages/ui`: 核心共享组件库（基于 shadcn/ui）
- `packages/shared`: 共享类型定义、工具函数、常量
- `packages/api-client`: 统一封装的后端 API 请求 SDK

---

## 三、网关统一路由规范

### 3.1 路由设计总则

所有前端请求**统一经过 api-gateway 网关**，外部禁止直接访问任何微服务实例。路由按业务模块统一前缀命名，便于运维管控、限流配置、日志聚合和灰度发布。

### 3.2 网关路由前缀映射表

| 业务模块 | 网关统一路由前缀 | 转发目标微服务 | 接口访问权限级别 |
|----------|-----------------|---------------|:---------------:|
| 登录注册认证相关 | `/api/auth/**` | auth-service | 公开接口（无需登录） |
| 用户资料与个人中心 | `/api/user/**` | user-service | 需登录鉴权 |
| 论坛帖子核心业务 | `/api/forum/**` | forum-service | 部分公开，部分需登录 |
| AI智能创作与审核 | `/api/ai/**` | ai-service | 需登录鉴权 |
| 全站搜索与AI检索 | `/api/search/**` | ai-service | 公开可访问 |
| 消息通知推送 | `/api/message/**` | message-service | 需登录鉴权 |
| 后台管理运维接口 | `/api/admin/**` | 全服务内部聚合 | 超级管理员专属 |

**网关全局处理**：
- JWT Token解析与用户身份注入请求头
- 接口级别限流（IP维度 + 用户维度）
- 跨域CORS统一配置
- 请求日志记录与追踪ID传递
- 灰度发布路由（基于Header或Cookie）

---

## 四、多板块垂直行业体系

### 4.1 板块体系架构

LinkSee采用**树形二级分类**的板块结构，覆盖多个垂直行业领域：

```
LinkSee 社区
│
├── 🏗 技术研发 Technology
│   ├── 💻 软件开发          (Java/Go/Rust/前端/移动开发)
│   ├── 🤖 人工智能          (LLM/计算机视觉/NLP/AI应用)
│   ├── ☁ 云原生与DevOps    (Kubernetes/Docker/CI-CD/云服务)
│   └── 🔒 信息安全         (网络攻防/渗透测试/安全合规)
│
├── 📚 学术科研 Academia
│   ├── 🔬 自然科学          (物理/化学/生物/数学)
│   ├── 📐 工程技术          (机械/电子/土木/材料)
│   ├── 📊 数据科学          (统计学/数据分析/可视化)
│   └── 🎓 学术交流          (论文/科研方法/学术动态)
│
├── 💼 职业发展 Career
│   ├── 📋 职场经验          (职场生存/沟通技巧/效率工具)
│   ├── 🎯 求职招聘          (简历面试/薪资谈判/offer选择)
│   ├── 💡 创业分享          (创业故事/融资经验/团队管理)
│   └── 📈 行业洞察          (趋势分析/职业规划/技能提升)
│
├── 🎨 创意生活 Lifestyle
│   ├── ✍️ 内容创作          (写作/自媒体/文案策划)
│   ├── 📸 摄影设计          (摄影/平面/UI/UX)
│   ├── 🎮 数字娱乐          (游戏/动漫/影视/音乐)
│   └── 🌱 生活智慧          (旅行/美食/健康/理财)
│
└── ⚙️ LinkSee 运营区 Official
    ├── 📢 公告通知          (官方公告/更新日志)
    ├── 💬 功能建议          (需求反馈/功能讨论)
    ├── 🐛 问题反馈          (Bug报告/故障排查)
    └── 🏆 活动专区          (线上活动/挑战赛/荣誉墙)
```

### 4.2 板块特色配置

每个一级板块可独立配置以下属性，打造差异化体验：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| **视觉标识** | 图标、主题色、Banner | 技术=科技蓝、创意=活力橙 |
| **发帖模板** | 结构化引导式发帖表单 | 技术板块模板：问题描述/环境/尝试方案/期望结果 |
| **AI助手人设** | 该板块AI助手的风格和语气 | 技术板=严谨工程师；生活板=温暖朋友 |
| **自定义标签** | 板块内独立管理的标签体系 | #Kotlin #SpringBoot #微服务 |
| **版主团队** | 板块级别的管理角色 | 每个板块可有1-N个版主 |
| **准入规则** | 发帖/回复权限控制 | 某些板块需完成身份认证才可发帖 |
| **排序策略** | 默认排序方式差异 | 学术=按引用/质量；生活=按热度/时间 |

---

## 五、用户体系与权限架构

### 5.1 用户角色层级

```
┌─────────────────────────────────────────────────────────────┐
│                        角色金字塔                             │
│                                                             │
│                         👑 超级管理员                        │
│                     (系统Owner, 全局最高权限)                  │
│                              │                               │
│            ┌─────────────────┼─────────────────┐            │
│            ▼                 ▼                 ▼            │
│       🛡️ 站点管理员      📋 板块版主        ⭐ 认证用户     │
│     (全局管理权限)      (指定板块管理权)    (专业认证标识)   │
│            │                 │                 │            │
│            └─────────────────┼─────────────────┘            │
│                              ▼                               │
│                        👤 普通注册用户                       │
│                     (基础发帖评论互动权限)                    │
│                              ▼                               │
│                        👁️ 游客访客                           │
│                      (仅浏览权限，不可互动)                   │
└─────────────────────────────────────────────────────────────┘
```

**各角色权限矩阵**：

| 权限项 | 游客 | 普通用户 | 认证用户 | 版主 | 管理员 | 超管 |
|--------|:----:|:-------:|:-------:|:----:|:-----:|:----:|
| 浏览帖子/搜索 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 注册登录 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 发布帖子 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 评论/回复 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 点赞/收藏/关注 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 使用AI助手(受限) | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 使用AI问答 | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| 板块内管理 | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| 全站管理 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 用户/角色管理 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| 系统配置 | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### 5.2 用户等级成长体系（游戏化激励）

| 等级 | 名称 | 所需经验值 | 解锁特权 | 图标 |
|------|------|:---------:|----------|:----:|
| **LV1** | 萌新小白 | 0 | 发帖评论、每日3次AI免费调用 | 🌱 |
| **LV2** | 活跃新人 | 100 | 关注用户/收藏帖子、每日5次AI调用 | 🌿 |
| **LV3** | 社区达人 | 500 | 创建个人标签、每日10次AI、自定义头像框 | 🌳 |
| **LV4** | 领域专家 | 2000 | 板块认证标识、每日20次AI、优先审核通道 | 🔥 |
| **LV5** | 灵犀之星 | 5000 | 版主提名资格、**无限AI调用**、专属发光标识 | ⭐ |
| **LV6** | 社区领袖 | 10000+ | 特殊决策参与权、荣誉墙展示、定制徽章 | 👑 |

### 5.3 积分获取规则

```
┌─────────────────────────────────────────────────────────────┐
│                      积分获取渠道                            │
├─────────────┬──────────────────┬────────────────────────────┤
│   类别      │       行为       │          积分奖励            │
├─────────────┼──────────────────┼────────────────────────────┤
│ 日常互动    │ 发布帖子          │ +10 分/篇                  │
│             │ 发表评论          │ +2 分/条                   │
│             │ 点赞他人          │ +1 分/次(每日上限20)        │
│             │ 被他人点赞        │ +3 分/次                   │
│             │ 每日签到          │ +5 分/天(连续签到递增)      │
├─────────────┼──────────────────┼────────────────────────────┤
│ 内容质量    │ 帖子被收藏        │ +5 分/次                   │
│             │ 帖子被设为精华    │ +20 分/次                  │
│             │ 帖子被置顶        │ +50 分/次                  │
│             │ 回答被采纳为最佳  │ +15 分/次                  │
├─────────────┼──────────────────┼────────────────────────────┤
│ 社区贡献    │ 举报违规(核实后)  │ +2 分/次                   │
│             │ 连续活跃7天       │ +30 分                     │
│             │ 发布首篇精华帖    │ +50 分                     │
│             │ 获得100个粉丝     │ +100 分                    │
└─────────────┴──────────────────┴────────────────────────────┘
```

**扣分机制（负向激励）**：
- 帖子被删除/违规：-20 分
- 评论被举报核实：-5 分
- 被禁言：根据严重程度扣分
- 低于0分将限制部分功能使用

---

## 六、AI双引擎功能设计

### 6.1 AI创作助手引擎

嵌入富文本编辑器的**实时AI协作工具栏**，用户撰写帖子过程中随时召唤AI辅助。

```
┌─────────────────────────────────────────────────────────────┐
│                  AI 创作助手 — 8大功能矩阵                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 📝 标题   │  │ 📋 大纲   │  │ ✨ 润色   │  │ 🔄 续写   │   │
│  │  生成     │  │  辅助     │  │  优化     │  │  扩写     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 🌍 翻译   │  │ 📊 摘要   │  │ 🏷️ 标签   │  │ 💡 灵感   │   │
│  │  多语言   │  │  提炼     │  │  推荐     │  │  激发     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 各功能详细说明

| 功能编号 | 功能名称 | 触发方式 | 输入 | 输出 | 使用场景 |
|:-------:|----------|---------|------|------|----------|
| F01 | **智能标题生成** | 点击按钮 | 正文内容或关键词描述 | 5个不同风格的候选标题（技术向/提问向/故事向/数据向/悬念向） | 写好正文后不知道起什么标题 |
| F02 | **大纲辅助** | 点击按钮 | 话题主题 + 选择板块 + 细节程度 | 结构化的文章大纲（含章节标题和建议字数） | 有想法但不知道如何组织结构 |
| F03 | **智能润色优化** | 选中文本后触发 | 选中的文字段落 + 强度选择（轻度/中度/深度） | 优化后的文本 + 差异高亮对比 | 觉得表达不够流畅或不够专业时 |
| F04 | **智能续写扩写** | 光标放置位置触发 | 光标前的上下文 + 模式选择 | 自动续写的内容段（直接插入光标处） | 写到一半卡壳了需要启发 |
| F05 | **多语言翻译** | 选中文本后触发 | 选中文本 + 目标语言 | 翻译结果 | 需要中英互译或多语言发布 |
| F06 | **摘要提炼** | 点击按钮 | 完整文章内容 + 最大长度 | 精炼的摘要（用于SEO和列表展示） | 发布前自动生成摘要 |
| F07 | **智能标签推荐** | 点击/自动触发 | 标题 + 正文 + 所选板块 | 推荐的相关标签列表 | 不知道用什么标签更好 |
| F08 | **灵感激发** | 点击按钮 | 当前话题/板块 | 相关的角度、观点、案例建议 | 缺乏创作思路时获取启发 |

### 6.2 AI智能问答引擎（RAG）

基于社区内容的**检索增强生成(RAG)** 智能问答系统 —— 这是LinkSee最核心的差异化功能。

#### RAG工作流架构

```
用户提问输入
     │
     ▼
┌──────────────────────────────────────────┐
│  第一步: 意图识别与查询改写              │
│  · 提取关键实体和用户意图                │
│  · 同义词扩展和相关术语联想              │
│  · 匹配对应的板块领域                    │
│  · 查询改写为最优检索表达式              │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  第二步: 多路混合检索 (Hybrid Search)     │
│                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ ES全文  │  │ Milvus  │  │ Postgres│  │
│  │ 关键词  │  │ 向量语义 │  │ 结构化  │  │
│  │ 检索   │  │ 相似度  │  │ 最新/热门│  │
│  └────┬────┘  └────┬────┘  └────┬────┘  │
│       │            │            │         │
│       └────────────┴────────────┘         │
│                并行检索                    │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  第三步: 结果融合重排序 (Reranking)        │
│                                          │
│  综合得分 =                              │
│  α×相关性得分 + β×质量评分               │
│  + γ×新鲜度衰减 + δ×作者权威度            │
│                                          │
│  (α,β,γ,δ 为可调权重参数)                │
└──────────────────────────────────────────┘
     │
     ▼
┌──────────────────────────────────────────┐
│  第四步: LLM生成回答 (RAG Generation)     │
│                                          │
│  Prompt = 系统提示词                      │
│  + 检索到的Top-K优质上下文               │
│  + 用户原始问题                          │
│  + 格式要求(引用来源/结构化)              │
│                                          │
│  → 生成回答 + 引用来源帖子列表             │
│  + 推荐追问建议                           │
└──────────────────────────────────────────┘
     │
     ▼
  展示给用户
```

#### 问答交互特色

- **引用来源透明化**：每段回答标注来自哪篇帖子、哪位作者
- **追问延续性**：基于当前对话上下文持续深入探讨
- **跳转原文便捷**：点击引用可直接跳转到原帖阅读完整内容
- **不满意可反馈**：用户可标记"有帮助/无帮助"，用于优化排序算法

### 6.3 多模型适配层架构

```
┌─────────────────────────────────────────────────────────────┐
│                   AI-Service 多模型调度层                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AI Model Router (模型路由调度器)          │   │
│  │                                                     │   │
│  │  职责:                                               │   │
│  │  · 按场景智能选择最优模型                             │   │
│  │  · 负载均衡与故障自动切换                             │   │
│  │  · 用量配额管理与成本控制                             │   │
│  │  · 模型调用日志与性能监控                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                  │
│       ┌─────────────────┼─────────────────┐               │
│       ▼                 ▼                 ▼               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │ 智谱GLM-4│    │ 通义千问  │    │ Kimi     │           │
│  │          │    │ Qwen-Max │    │ 月之暗面  │           │
│  │ ★主力模型│    │ ○备用模型│    │ ○长文本  │           │
│  └──────────┘    └──────────┘    └──────────┘           │
│                                                             │
│  场景分配策略:                                               │
│  ┌────────────────┬─────────────────┬──────────────┐      │
│  │ AI功能场景      │ 首选模型         │ 备选/兜底     │      │
│  ├────────────────┼─────────────────┼──────────────┤      │
│  │ 创作助手(8功能) │ 智谱GLM-4       │ 通义千问      │      │
│  │ 智能问答(RAG)   │ 通义千问(性价比) │ GLM-4        │      │
│  │ 长文摘要/分析   │ Kimi(128K上下文)│ GLM-4-Long   │      │
│  │ 内容审核        │ 通义千问(安全版) │ 自建规则引擎  │      │
│  └────────────────┴─────────────────┴──────────────┘      │
│                                                             │
│  故障转移策略: 当首选模型超时/报错 → 自动切换备选 → 重试请求  │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 AI用量控制策略

| 用户等级 | 每日免费额度 | 创作助手 | 智能问答 | 超出后的处理方式 |
|:--------:|:-----------:|:-------:|:-------:|----------------|
| LV1 萌新小白 | 3次/天 | ✅ 可用 | ❌ 仅预览前半部分 | 弹窗提示"升级等级解锁更多" |
| LV2 活跃新人 | 5次/天 | ✅ 可用 | ✅ 可用 | 提示"今日额度已用完，明日再来" |
| LV3 社区达人 | 10次/天 | ✅ 可用 | ✅ 可用 | 同上 |
| LV4 领域专家 | 20次/天 | ✅ 可用 | ✅ 可用 | 正常使用（一般够用） |
| LV5 灵犀之星 | **无限制** | ✅ | ✅ | 无任何限制 |
| LV6 社区领袖 | **无限制 + 优先通道** | ✅ | ✅ | 最高优先级，高峰期不排队 |

**注意**：此为V1阶段策略。后续商业化时可引入付费购买额外额度。

---

## 七、核心业务流程

### 7.1 发帖主流程

```
用户点击"发布帖子"
     │
     ▼
[前端校验] 登录状态检查 + 必填项验证 + 敏感词预检
     │
     ▼
[网关层] JWT鉴权通过 → IP限流检查 → 路由至 forum-service
     │
     ▼
[Forum Service] 接收请求数据
     │
     ├─→ 写入 PostgreSQL 主库 (forum_post 表)
     │
     ├─→ 更新 Redis 缓存:
     │     · 用户发帖数计数器 +1
     │     · 板块最新帖子列表刷新
     │     · 用户经验值 +10
     │
     └─→ 发送 RabbitMQ 异步消息:
           ├─→ [AI审核队列] → ai-service 异步审核
           ├─→ [ES同步队列] → 异步构建搜索索引
           ├─→ [AI摘要队列] → 生成AI摘要和关键词
           └─→ [向量入库队列] → 生成Embedding写入Milvus
     │
     ▼
[立即返回] 帖子ID + 发布成功 → 前端跳转帖子详情页
     │
     ▼
[后台异步完成] 审核通过 → 帖子状态变为"已发布可见"
                    审核不通过 → 标记违规 + 通知用户修改
```

### 7.2 搜索主流程

```
用户输入搜索关键词 或 点击"问AI"
     │
     ├─── 传统搜索路径 ───┐
     │                     │
     ▼                     ▼
 [网关路由]          [网关路由]
 至 search接口       至 ai/chat接口
     │                     │
     ▼                     ▼
 [ES关键词全文检索]   [RAG完整流程]
  · 分词              · 意图识别
  · 多字段匹配         · 混合检索(ES+Milvus+PG)
  · 高亮显示           · 结果融合排序
  · 按相关性/时间排序   · LLM生成回答
     │                     │ + 引用来源
     └─────────┬──────────┘
               │
               ▼
         [结合用户画像]
      （兴趣标签 + 历史行为）
               │
               ▼
         [个性化排序调整]
               │
               ▼
         [返回搜索结果]
      帖子列表 + AI问答卡片(如有)
```

### 7.3 AI赋能流程

**核心原则：所有AI处理均为异步非阻塞，不影响用户操作主流程的响应速度。**

```
用户触发的AI操作 (创作助手/问答)
     │
     ▼
[前端] 展示加载动画 + 流式输出(如果支持SSE)
     │
     ▼
[ai-service接收]
     │
     ├─→ [同步路径 - 适用于创作助手]
     │     │
     │     ├─→ 校验用户当日剩余额度
     │     ├─→ 扣减额度计数(Redis原子操作)
     │     ├─→ 调用大模型API (带超时控制30s)
     │     ├─→ 记录调用日志(ai_task_record表)
     │     └─→ SSE流式返回结果给前端
     │
     └─→ [异步路径 - 适用于审核/摘要/索引]
           │
           └─→ MQ消费者处理:
                 ├─→ AI内容审核 (违规检测 + 分类打标)
                 ├─→ AI摘要生成 (提取要点 + 生成概要)
                 ├─→ ES索引同步 (增量更新搜索索引)
                 └─→ Milvus向量入库 (Embedding生成 + 存储)
```

### 7.4 缓存交互流程

```
读取请求到达
     │
     ▼
 [第一步] 查询 Redis 缓存
     │
     ├── 命中缓存 ──→ 直接返回缓存数据 (毫秒级响应)
     │
     └── 未命中 ──→ [第二步] 查询 PostgreSQL 从库
                        │
                        ├── 查询成功 ──→ 将结果回写Redis缓存
                        │              └→ 设置合理TTL过期时间
                        │
                        └── 查询失败 ──→ [第三步] 降级处理
                                             ├─→ 返回默认值/空数据
                                             ├─→ 记录异常日志
                                             └─→ 触发告警通知运维

缓存更新策略 (Write-Through + Cache-Aside混合):
     │
     ├─→ 写入DB成功 → 同步更新/删除对应缓存Key
     ├─→ 删除DB记录 → 同步删除对应缓存Key
     └─→ 定时任务 → 清理过期缓存 + 预热热点数据
```

---

## 八、前端页面结构

### 8.1 页面路由规划

```
/
├── /                           # 首页 — 推荐流/热门帖子信息流
├── /forum                      # 论坛总入口
│   ├── /forum/:categoryId      # 板块详情页 — 该板块下帖子列表
│   ├── /post/create            # 发帖编辑页 — 含AI创作工具栏
│   ├── /post/:id               # 帖子详情页 — 正文+评论区+侧边栏
│   └── /post/:id/edit          # 帖子编辑页
├── /search                     # 搜索结果页 — 关键词检索结果
├── /ai                         # AI对话专区 — 完整RAG问答界面
├── /user                       # 个人中心
│   ├── /user/profile           # 个人资料设置
│   ├── /user/posts             # 我发布的帖子
│   ├── /user/favorites         # 我的收藏夹
│   ├── /user/follows           # 关注/粉丝列表
│   └── /user/settings          # 账号安全设置
├── /u/:userId                  # 其他用户的主页(公开查看)
├── /message                    # 消息通知中心
├── /chat                       # 实时聊天总入口
│   ├── /chat/room/:roomId      # 聊天室群聊窗口
│   └── /chat/dm/:userId        # 用户私聊窗口
├── /admin                      # 后台管理面板(需管理员权限)
└── /auth                       # 认证相关
    ├── /auth/login             # 登录页
    └── /auth/register          # 注册页
```

### 8.2 核心页面说明

#### 首页 (`/`)
- **顶部导航栏**：Logo、搜索框（支持回车搜索/问AI）、板块快捷切换、消息铃铛、用户头像下拉菜单
- **Tab栏**：推荐(默认) / 关注 / 热门 / 最新 / 精华
- **信息流**：帖子卡片列表（虚拟滚动优化），每张卡片包含：作者头像+昵称+等级标签、板块标签、标题、AI摘要（如有）、底部操作栏（点赞/评论/收藏/分享数）
- **右侧边栏**：热门话题榜、活跃用户榜、AI每日推荐

#### 发帖编辑页 (`/post/create`)
- **左侧主区域**：富文本Markdown编辑器（支持代码高亮、图片粘贴上传、LaTeX公式）
- **右侧AI工具栏**：常驻悬浮面板，包含8个AI功能的快捷入口
- **顶部选项**：选择板块（必填）、添加标签（AI推荐）、设置可见范围
- **底部操作栏**：草稿自动保存、预览、发布按钮、AI质量检测提示

#### 帖子详情页 (`/post/:id`)
- **面包屑导航**：首页 > 板块名 > 帖子标题
- **正文区**：标题 + 元信息（作者/时间/浏览量）+ 富文本渲染内容 + AI摘要卡片
- **评论区**：支持二级嵌套回复，按热度/时间排序切换
- **右侧边栏**：作者信息卡 + 关注按钮、文章目录（长文自动提取）、相关推荐、"AI总结此文"按钮、"继续提问"入口

#### AI问答页 (`/ai`)
- **左侧对话区**：类似ChatGPT的消息流界面，支持Markdown渲染
- **每条AI回答包含**：结构化回答内容 + 引用来源链接 + 推荐追问气泡
- **右侧辅助区**：热门问题列表、历史会话记录
- **输入区**：文本框 + 附件按钮 + 语音输入预留 + 发送按钮

#### 实时聊天页 (`/chat`)
- **左侧列表**（w-80）：聊天室列表（管理员预设）+ 私聊联系人列表（最近对话排序）+ 搜索过滤
- **右侧对话区**：顶部房间名/对方昵称 + 在线状态指示 + 消息列表（虚拟滚动，向上加载历史）+ 底部输入框（支持 Enter 发送、Shift+Enter 换行）
- **消息气泡**：显示头像、昵称、时间戳，自己的消息靠右蓝色，他人消息靠左灰色
- **实时特性**：WebSocket 长连接、心跳保活、断线重连、离线消息队列、打字状态提示、新消息未读角标
- **通信架构**：实时消息走 ws-server (Kotlin/Spring WebFlux WebSocket)，历史消息走 REST 接口

---

## 九、数据模型设计

### 9.1 设计原则

- **通用基础字段**：所有表均包含 `id`(主键自增) + `created_at` + `updated_at` + `deleted`(逻辑删除)
- **大文本字段**：帖子正文、评论内容使用 PostgreSQL `text` 类型
- **扩展属性**：使用 `JSONB` 类型存储灵活扩展字段，避免频繁DDL变更
- **外键策略**：关联关系通过代码逻辑控制，数据库不建立物理外键（提升高并发写入性能）
- **计数冗余**：点赞数/评论数/收藏数/浏览量等高频读取字段做适度冗余，通过异步事件保持一致性

### 9.2 核心数据表清单

| 表名 | 中文名称 | 核心存储内容 | 所属服务 | 是否同步ES |
|------|----------|-------------|----------|:----------:|
| `sys_user` | 用户主表 | 账号、密码哈希、昵称、头像URL、邮箱、手机号、状态 | user-service | 否 |
| `sys_user_profile` | 用户扩展表 | 简介、所在地、社交链接、技能标签、教育背景、职业、等级、经验值 | user-service | 否 |
| `sys_role` | 角色表 | 角色编码、名称、描述、权限范围 | auth-service | 否 |
| `sys_user_role` | 用户角色关联 | user_id + role_id 多对多关系 | auth-service | 否 |
| `forum_category` | 板块分类表 | 名称、图标、父级ID、描述、排序权重、状态 | forum-service | 是 |
| `forum_post` | 帖子主表 | 标题、正文、作者ID、分类ID、封面图、状态(草稿/已发布/已删除)、是否精华/置顶、各类计数字段 | forum-service | **✅ 全量同步** |
| `forum_post_ai_data` | 帖子AI增强数据 | AI摘要、AI关键词、情感倾向、质量评分、预估阅读时长、向量ID | ai-service | 部分 |
| `forum_comment` | 评论表 | 内容、父评论ID、帖子ID、用户ID、点赞数、状态 | forum-service | **✅ 增量同步** |
| `forum_like_record` | 点赞收藏记录 | 用户ID + 目标类型(post/comment) + 目标ID + 行为类型(like/collect) | forum-service | 否 |
| `forum_follow` | 关注关系表 | 关注者ID + 被关注者ID + 创建时间 | forum-service | 否 |
| `ai_task_record` | AI任务调用记录 | 任务类型、输入输出(脱敏)、使用模型、Token消耗、响应时间、状态 | ai-service | 否 |
| `ai_moderation_log` | AI审核日志 | 内容ID、审核结果、违规类型、置信度、处理动作 | ai-service | 否 |
| `message_notice` | 消息通知表 | 类型(互动/系统/AI)、标题、内容、收件人ID、是否已读 | message-service | 否 |
| `user_level_log` | 用户等级变动日志 | 用户ID、旧等级、新等级、变动原因 | user-service | 否 |
| `chat_room` | 聊天室表 | 房间名称、图标、描述、排序权重、在线人数、状态 | ws-server | 否 |
| `chat_message` | 聊天消息表 | room_id、sender_id、receiver_id、content、msg_type | ws-server | 否 |

### 9.3 扩展数据表设计详情

#### sys_user (用户主表)
```sql
CREATE TABLE sys_user (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,       -- 登录用户名
    password_hash   VARCHAR(255) NOT NULL,              -- BCrypt加密密码
    nickname        VARCHAR(50)  NOT NULL DEFAULT '',    -- 昵称
    avatar_url      VARCHAR(500) DEFAULT '',            -- 头像URL
    email           VARCHAR(100) DEFAULT '',             -- 邮箱
    phone           VARCHAR(20)  DEFAULT '',             -- 手机号
    level           SMALLINT     NOT NULL DEFAULT 1,     -- 用户等级 LV1-6
    experience      INT          NOT NULL DEFAULT 0,     -- 总经验值
    daily_ai_calls  INT          NOT NULL DEFAULT 0,     -- 今日已用AI次数
    status          SMALLINT     NOT NULL DEFAULT 1,     -- 1正常 0禁用
    last_login_at   TIMESTAMPTZ,                          -- 最后登录时间
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted         SMALLINT     NOT NULL DEFAULT 0      -- 逻辑删除标记
);

CREATE INDEX idx_sys_user_username ON sys_user(username);
CREATE INDEX idx_sys_user_email ON sys_user(email);
CREATE INDEX idx_sys_user_status ON sys_user(status) WHERE deleted = 0;
```

#### sys_user_profile (用户扩展表)
```sql
CREATE TABLE sys_user_profile (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE REFERENCES sys_user(id),
    bio             TEXT         DEFAULT '',              -- 个人简介
    location        VARCHAR(100) DEFAULT '',              -- 所在城市
    personal_website VARCHAR(500) DEFAULT '',             -- 个人网站
    social_links    JSONB        DEFAULT '{}',            -- 社交媒体链接
    skills_tags     JSONB        DEFAULT '[]',            -- 技能标签数组
    education       VARCHAR(200) DEFAULT '',              -- 教育背景
    occupation      VARCHAR(100) DEFAULT '',              -- 职业
    is_verified     BOOLEAN      NOT NULL DEFAULT FALSE,  -- 是否认证用户
    verify_info     JSONB        DEFAULT '{}',            -- 认证详细信息
    follower_count  INT          NOT NULL DEFAULT 0,      -- 粉丝数(冗余)
    following_count INT          NOT NULL DEFAULT 0,      -- 关注数(冗余)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

#### forum_category (板块分类表)
```sql
CREATE TABLE forum_category (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50)  NOT NULL,                -- 板块名称
    icon            VARCHAR(50)  DEFAULT '',              -- 图标标识
    parent_id       BIGINT       DEFAULT NULL,            -- 父级ID(一级分类为NULL)
    description     TEXT         DEFAULT '',              -- 板块描述
    sort_order      INT          NOT NULL DEFAULT 0,      -- 排序权重
    post_count      INT          NOT NULL DEFAULT 0,      -- 帖子总数(冗余)
    theme_color     VARCHAR(20)  DEFAULT '#1890ff',       -- 主题色
    post_template   JSONB        DEFAULT '{}',            -- 发帖模板配置
    ai_persona      VARCHAR(200) DEFAULT '专业友好的助手', -- AI人设描述
    status          SMALLINT     NOT NULL DEFAULT 1,      -- 1启用 0禁用
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted         SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_forum_category_parent ON forum_category(parent_id) WHERE deleted = 0;
```

#### forum_post (帖子主表 — 核心业务表)
```sql
CREATE TABLE forum_post (
    id              BIGSERIAL PRIMARY KEY,
    author_id       BIGINT       NOT NULL REFERENCES sys_user(id),
    category_id     BIGINT       NOT NULL REFERENCES forum_category(id),
    title           VARCHAR(200) NOT NULL,                -- 帖子标题
    content         TEXT         NOT NULL,                -- 帖子正文(Markdown)
    cover_image_url VARCHAR(500) DEFAULT '',              -- 封面图
    summary         TEXT         DEFAULT '',              -- 手动或AI生成的摘要
    tag_list        JSONB        DEFAULT '[]',            -- 标签数组
    
    -- 统计字段(适度冗余, 通过异步事件更新)
    view_count      INT          NOT NULL DEFAULT 0,
    like_count      INT          NOT NULL DEFAULT 0,
    comment_count   INT          NOT NULL DEFAULT 0,
    collect_count   INT          NOT NULL DEFAULT 0,
    
    -- 状态字段
    status          SMALLINT     NOT NULL DEFAULT 0,      -- 0草稿 1已发布 2审核中 3违规
    is_top          BOOLEAN      NOT NULL DEFAULT FALSE,   -- 是否置顶
    is_essence      BOOLEAN      NOT NULL DEFAULT FALSE,   -- 是否精华帖
    sort_weight     DOUBLE PRECISION NOT NULL DEFAULT 0,   -- 综合排序权重
    
    -- 时间戳
    published_at    TIMESTAMPTZ,                          -- 发布时间(首次发布时设置)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted         SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_forum_post_author ON forum_post(author_id) WHERE deleted = 0 AND status = 1;
CREATE INDEX idx_forum_post_category ON forum_post(category_id) WHERE deleted = 0 AND status = 1;
CREATE INDEX idx_forum_post_status ON forum_post(status, created_at DESC) WHERE deleted = 0;
CREATE INDEX idx_forum_post_hot ON forum_post(sort_weight DESC) WHERE deleted = 0 AND status = 1;
CREATE INDEX idx_forum_post_published ON forum_post(published_at DESC) WHERE deleted = 0 AND status = 1;
```

#### forum_comment (评论表)
```sql
CREATE TABLE forum_comment (
    id              BIGSERIAL PRIMARY KEY,
    post_id         BIGINT       NOT NULL REFERENCES forum_post(id),
    user_id         BIGINT       NOT NULL REFERENCES sys_user(id),
    parent_id       BIGINT       DEFAULT NULL,            -- 父评论ID(NULL=一级评论)
    content         TEXT         NOT NULL,                -- 评论内容
    like_count      INT          NOT NULL DEFAULT 0,
    status          SMALLINT     NOT NULL DEFAULT 1,      -- 1正常 0隐藏/违规
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted         SMALLINT     NOT NULL DEFAULT 0
);

CREATE INDEX idx_forum_comment_post ON forum_comment(post_id, created_at ASC) WHERE deleted = 0 AND status = 1;
CREATE INDEX idx_forum_comment_parent ON forum_comment(parent_id) WHERE deleted = 0;
```

#### ai_task_record (AI任务调用记录表)
```sql
CREATE TABLE ai_task_record (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT       NOT NULL REFERENCES sys_user(id),
    
    -- 任务信息
    task_type       VARCHAR(30)  NOT NULL,                -- TITLE_GENERATE / POLISH / QA_CHAT 等
    input_summary   TEXT         DEFAULT '',              -- 输入摘要(脱敏存储)
    output_content  TEXT,                                 -- AI输出结果
    model_used      VARCHAR(50)  NOT NULL,                -- 实际调用的模型
    
    -- 消耗指标
    tokens_input    INT          DEFAULT 0,               -- 输入Token数
    tokens_output   INT          DEFAULT 0,               -- 输出Token数
    response_ms     INT          DEFAULT 0,               -- 响应耗时(毫秒)
    
    -- 状态
    status          SMALLINT     NOT NULL DEFAULT 0,      -- 0进行中 1成功 2失败 3超时
    error_message   TEXT         DEFAULT '',
    
    -- 关联(可选)
    target_type     VARCHAR(20)  DEFAULT '',              -- 关联目标类型 post/comment
    target_id       BIGINT       DEFAULT 0,               -- 关联目标ID
    
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_task_user ON ai_task_record(user_id, created_at DESC);
CREATE INDEX idx_ai_task_type ON ai_task_record(task_type, created_at DESC);
CREATE INDEX idx_ai_task_status ON ai_task_record(status, created_at DESC);
```

#### chat_room (聊天室表)
```sql
CREATE TABLE chat_room (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(50)  NOT NULL,
    icon            VARCHAR(50)  DEFAULT 'messages-square',
    description     TEXT         DEFAULT '',
    member_count    INT          NOT NULL DEFAULT 0,
    sort_order      INT          NOT NULL DEFAULT 0,
    status          SMALLINT     NOT NULL DEFAULT 1,      -- 1启用 0禁用
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```
- 聊天室由管理员在后台预设，普通用户只读列表
- `member_count` 为在线人数缓存冗余，由 ws-server 定时同步

#### chat_message (聊天消息表)
```sql
CREATE TABLE chat_message (
    id              BIGSERIAL PRIMARY KEY,
    room_id         BIGINT       DEFAULT NULL,            -- NULL=私聊, 非NULL=群聊
    sender_id       BIGINT       NOT NULL,
    receiver_id     BIGINT       DEFAULT NULL,            -- 私聊接收者(NULL=群聊)
    content         TEXT         NOT NULL,
    msg_type        SMALLINT     NOT NULL DEFAULT 1,      -- 1文本 2图片 3系统消息
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_msg_room ON chat_message(room_id, created_at);
CREATE INDEX idx_chat_msg_dm ON chat_message(sender_id, receiver_id, created_at);
```
- `room_id IS NULL` 区分私聊消息，通过 `sender_id + receiver_id` 组合查询
- 历史消息采用游标分页：`WHERE created_at < :before ORDER BY created_at DESC LIMIT 50`

---

## 十、中间件设计规范

### 10.1 Redis缓存Key标准化设计

**命名格式规范**：`{项目前缀}:{微服务名}:{业务模块}:{唯一标识}`

**TTL分级策略**：
- **永久缓存**：系统配置、字典数据、板块分类等低频变动的全局数据
- **24小时**：用户基本信息、帖子元数据等中等频率变化的数据
- **1小时**：热点帖子列表、排行榜等高频变化但允许短延迟的数据
- **分钟级**：限流计数器、临时验证码等短期有效数据

**核心缓存Key明细表**：

| Key名称 | Key格式 | 缓存内容 | TTL | 更新时机 |
|---------|---------|----------|:---:|----------|
| 用户登录Token | `forum:auth:token:{userId}` | JWT令牌 + 设备指纹 + 登录状态 | 2小时 | 登录写入 / 退出删除 / 操作续期 |
| 用户基础信息 | `forum:user:info:{userId}` | 昵称、头像、等级、经验值 | 24h | 资料修改时同步更新 |
| 用户权限缓存 | `forum:user:perms:{userId}` | 角色+权限列表 | 2h | 角色变更时清除 |
| 板块全量列表 | `forum:category:all` | 所有启用的板块分类树 | 永久 | 后台编辑板块时刷新 |
| 板块下帖子列表 | `forum:post:list:{categoryId}:{page}:{sort}` | 分页帖子ID列表 | 10min | 发帖/删帖/置顶时清除 |
| 热门帖子排行 | `forum:post:hot:{categoryId}` | Top-N热门帖子ID+分数 | 1h | 点赞/收藏/浏览时异步更新 |
| 帖子详情 | `forum:post:detail:{postId}` | 帖子完整对象(不含正文) | 30min | 帖子编辑/统计数据变化时更新 |
| 帖子点赞计数 | `forum:like:count:{postId}` | 实时点赞数量 | 永久 | 点赞/取消点赞原子增减 |
| 帖子收藏计数 | `forum:collect:count:{postId}` | 实时收藏数量 | 永久 | 收藏/取消收藏原子增减 |
| 用户点赞状态 | `forum:user:like:{userId}:{targetType}:{targetId}` | 已点赞集合(Set) | 24h | 点赞行为时Set操作 |
| AI每日调用次数 | `forum:ai:daily:{userId}:{date}` | 当日已调用AI次数 | 到次日自然过期 | 每次调用INCR |
| IP限流计数 | `forum:limit:{type}:{ip}` | 请求次数计数 | 1min/1h | 每次请求INCR |
| 热搜关键词 | `forum:search:hot` | Top-20热搜关键词+热度 | 1h | 搜索时异步更新ZSET |
| 聊天室在线用户 | `chat:room:online:{roomId}` | 当前在线用户ID集合(Set) | 实时 | 加入/离开房间时 SADD/SREM |
| 用户在线状态 | `chat:user:online:{userId}` | 在线状态 + 连接的 ws-server 实例 | 实时 | 连接/断开时 SET/DEL |
| 私聊联系人缓存 | `chat:dm:contacts:{userId}` | 最近私聊联系人列表(ZSET) | 24h | 发送/接收私聊时 ZADD |

**缓存更新策略**：
- **Cache-Aside（旁路缓存）**：读时先查缓存，未命中查DB再回写缓存
- **Write-Through（写穿透）**：写DB成功后同步更新/删除缓存（保证一致性优先的场景）
- **延迟双删**：先删缓存→写DB→延时(如500ms)再删一次缓存（防止并发脏读）

### 10.2 Elasticsearch索引结构设计

**设计原则**：
- 仅存储搜索和展示所需的必要字段，不存储完整大文本正文
- 帖子的增删改通过RabbitMQ异步同步到ES索引
- 采用中文智能分词(IK Analyzer)，适配中文论坛搜索场景
- ES只承担检索排序职责，不做事务持久化

#### forum_post_index (帖子搜索索引)

```json
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "ik_smart_synonym": {
          "type": "custom",
          "tokenizer": "ik_smart",
          "filter": ["synonym_filter", "lowercase"]
        },
        "ik_max_word_pinyin": {
          "type": "custom",
          "tokenizer": "ik_max_word",
          "filter": ["pinyin_filter", "lowercase"]
        }
      },
      "filter": {
        "synonym_filter": {
          "type": "synonym",
          "synonyms_path": "analysis/synonyms.txt"
        },
        "pinyin_filter": {
          "type": "pinyin",
          "keep_separate_first_letter": false,
          "keep_full_pinyin": true
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "postId":        { "type": "keyword" },
      "title":        { 
        "type": "text", 
        "analyzer": "ik_max_word",
        "fields": {
          "smart": { "type": "text", "analyzer": "ik_smart" },
          "pinyin": { "type": "text", "analyzer": "ik_max_word_pinyin" }
        }
      },
      "summary":      { "type": "text", "analyzer": "ik_smart" },
      "tagList":      { "type": "keyword" },
      "categoryId":   { "type": "keyword" },
      "categoryName": { "type": "keyword" },
      "authorId":     { "type": "keyword" },
      "authorName":   { "type": "keyword", "fields": { "pinyin": { "type": "text", "analyzer": "pinyin_filter" } } },
      
      "aiSummary":    { "type": "text", "analyzer": "ik_smart" },
      "aiKeywords":   { "type": "keyword" },
      
      "hotScore":     { "type": "double" },
      "qualityScore": { "type": "double" },       -- AI质量评分
      
      "status":       { "type": "keyword" },
      "isEssence":    { "type": "boolean" },
      "isTop":        { "type": "boolean" },
      
      "createTime":   { "type": "date", "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis" },
      "publishedTime":{"type": "date", "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis" }
    }
  }
}
```

**搜索场景与查询策略**：

| 搜索场景 | 查询字段组合 | 排序方式 |
|----------|-------------|----------|
| 全文搜索(默认) | `title^3 + summary^2 + aiKeywords^1` | 综合相关性得分 × 热度权重 |
| 按板块筛选 | 上述 + `categoryId`精确过滤 | 同上 |
| 按标签筛选 | `tagList`精确匹配 | 最新发布时间 |
| 按作者搜索 | `title` + `authorName`拼音搜索 | 相关性 |
| 热搜推荐 | `hotScore`降序 | 热度分 |
| AI语义搜索 | 向量检索(Milvus) + ES结果混合 | 融合重排序 |

### 10.3 RabbitMQ消息队列设计

**Exchange与Queue规划**：

| Exchange名称 | 类型 | 用途 | 绑定的Queue |
|-------------|------|------|------------|
| `forum.exchange.direct` | Direct | 论坛核心事件分发 | ai-moderate / es-sync / ai-summary / vector-ingest / stats-update |
| `ai.exchange.direct` | Direct | AI任务分发 | llm-call-complete / moderation-result |
| `user.exchange.fanout` | Fanout | 用户事件广播 | message-push / profile-cache-update |
| `notify.exchange.topic` | Topic | 通知消息路由 | notice-email / notice-inapp / notice-push |

**核心Queue定义**：

```
┌─────────────────────────────────────────────────────────────┐
│                     Message Queue 架构                       │
│                                                             │
│  【论坛事件 Queue】                                          │
│  ├── ai-moderate.queue       AI内容审核队列 (高优先级)       │
│  ├── es-sync.queue           ES索引同步队列                  │
│  ├── ai-summary.queue        AI摘要生成队列                  │
│  ├── vector-ingest.queue     Milvus向量入库队列              │
│  └── stats-update.queue      统计数据更新队列(低优先级)       │
│                                                             │
│  【AI任务 Queue】                                            │
│  ├── llm-call.queue          大模型API调用队列               │
│  └── moderation.result.queue 审核结果回调队列                │
│                                                             │
│  【通知 Queue】                                               │
│  ├── inapp-notice.queue       站内通知队列                   │
│  └── email-notice.queue       邮件通知队列(预留)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**消息可靠性保障**：
- 生产者端：开启 `confirm` 模式，确保消息到达Exchange
- Queue端：声明 `durable` 持久化队列，防止Broker重启丢失
- 消费者端：手动ACK，业务处理成功后才确认
- 死信队列(DLQ)：处理多次重试仍失败的消息，便于人工排查
- 消息幂等：消费者通过消息唯一ID去重，防止重复消费

---

## 十一、核心API接口设计

### 11.1 认证接口 (`/api/auth/**`)

```
POST   /api/auth/register              # 用户注册
       Body: { username, password, email?, emailCode?, captchaId, captchaValue }
       Resp: { userId, token, refreshToken, expiresIn }

POST   /api/auth/login                 # 登录
       Body: { username, password, captchaId?, captchaValue? }
       Resp: { userId, token, refreshToken, userInfo }

POST   /api/auth/logout                # 登出(失效Token黑名单)
       Header: Authorization: Bearer {token}

POST   /api/auth/refresh-token         # 刷新Token
       Body: { refreshToken }

POST   /api/auth/send-email-code       # 发送邮箱验证码
       Body: { email, type?: "register" | "reset-password" }
       Resp: null

POST   /api/auth/reset-password        # 重置密码（邮箱验证码方式）
       Body: { email, code, newPassword, confirmPassword }
       Resp: null

GET    /api/auth/captcha               # 获取图形验证码
       Resp: { captchaId, captchaImageBase64 }

GET    /api/auth/public-key            # 获取RSA公钥（请求体加密）
       Resp: { publicKey }
```

### 11.2 论坛业务接口 (`/api/forum/**`)

```
# === 板块分类 ===
GET    /api/forum/categories           # 获取板块分类树
       Query: ?includeStats=true
       Resp: [{ id, name, icon, children[], postCount }]

GET    /api/forum/category/:id         # 板块详情(含置顶/精华帖)
       Resp: { categoryInfo, topPosts[], essencePosts[] }


# === 帖子 CRUD ===
POST   /api/forum/post                 # 发布帖子
       Auth: ✅
       Body: { categoryId, title, content, tagList[], coverImageUrl? }
       Resp: { postId }

GET    /api/forum/post/:id             # 帖子详情
       Resp: { post: {...}, author: {...}, isLiked, isCollected }

PUT    /api/forum/post/:id             # 编辑帖子(仅作者/管理员)
       Auth: ✅
       Body: { title?, content?, tagList?, categoryId? }

DELETE /api/forum/post/:id             # 删除帖子(逻辑删除)
       Auth: ✅ (仅作者/管理员)

GET    /api/forum/posts                # 帖子列表(分页)
       Query: ?categoryId=&sort=hot/latest/hot&keyword=&page=1&size=20
       Resp: { total, list: [...], hasMore }


# === 评论 ===
POST   /api/forum/post/:id/comment     # 发表评论
       Auth: ✅
       Body: { content, parentId?(回复某条评论) }
       Resp: { commentId }

GET    /api/forum/post/:id/comments    # 评论列表(分页)
       Query: ?sortBy=hot/time&page=1&size=20&rootOnly=false
       Resp: { total, list: [...], hasMore }

DELETE /api/forum/comment/:id           # 删除评论
       Auth: ✅


# === 互动(点赞/收藏/关注) ===
POST   /api/forum/post/:id/like        # 点赞/取消点赞(toggle)
       Auth: ✅
       Resp: { liked, likeCount }

POST   /api/forum/post/:id/collect      # 收藏/取消收藏(toggle)
       Auth: ✅
       Resp: { collected, collectCount }

POST   /api/forum/user/:id/follow       # 关注/取消关注(toggle)
       Auth: ✅
       Resp: { followed, followerCount }
```

### 11.3 AI能力接口 (`/api/ai/**`)

```
# === AI创作助手 (8大功能) ===
POST   /api/ai/create/title-generate    # F01: 智能标题生成
       Auth: ✅
       Body: { content, categoryId, style?: 'technical|question|story|data|suspense' }
       Resp: { taskId, titles: ['...', '...', '...', '...', '...'] }

POST   /api/ai/create/outline-assist    # F02: 大纲辅助
       Auth: ✅
       Body: { topic, categoryId, detailLevel?: 'brief|standard|detailed' }
       Resp: { taskId, outline: { title, sections: [{ heading, points: [] }] } }

POST   /api/ai/create/polish-optimize   # F03: 智能润色优化
       Auth: ✅
       Body: { text, intensity?: 'light|medium|heavy', targetStyle?: 'formal|casual|academic|story' }
       Resp: { taskId, polishedText, diffHighlight: [{ original, modified }] }

POST   /api/ai/create/continue-write    # F04: 智能续写扩写
       Auth: ✅
       Body: { context, mode?: 'detail|argument|counterpoint|extend', maxLength?: 500 }
       Resp: { taskId, continuedText }

POST   /api/ai/create/translate         # F05: 多语言翻译
       Auth: ✅
       Body: { text, targetLang: 'en|ja|ko|fr|de|...' }
       Resp: { taskId, translatedText, detectedLang }

POST   /api/ai/create/summary-extract   # F06: 摘要提炼
       Auth: ✅ (也可系统内部调用)
       Body: { content, maxLength?: 200 }
       Resp: { taskId, summary, keywords: ['...'] }

POST   /api/ai/create/tag-recommend      # F07: 智能标签推荐
       Auth: ✅
       Body: { title, content, categoryId, limit?: 10 }
       Resp: { taskId, tags: [{ name, confidence }] }

POST   /api/ai/create/inspire            # F08: 灵感激发
       Auth: ✅
       Body: { topic, categoryId, count?: 5 }
       Resp: { taskId, inspirations: [{ angle, suggestion, example }]


# === AI智能问答 (RAG) ===
POST   /api/ai/chat/send                # 发送问题(支持SSE流式)
       Auth: ✅ (LV1以上)
       Body: { question, sessionId?, contextPostId?, stream?: true }
       Resp(Stream): { type:'content', delta:'...' } | { type:'sources', items:[...] } | { type:'followups', suggestions:[...] } | { type:'done' }

GET    /api/ai/chat/sessions             # 我的对话历史列表
       Auth: ✅
       Query: ?page=1&size=20
       Resp: { total, sessions: [{ id, title, lastMessageAt, messageCount }] }

GET    /api/ai/chat/session/:id/messages # 单个会话的完整消息记录
       Auth: ✅
       Resp: { messages: [{ role:'user'|'assistant', content, sources?, createdAt }] }

DELETE /api/ai/chat/session/:id          # 删除会话
       Auth: ✅


# === AI内部管理 ===
GET    /api/admin/ai/usage/stats         # AI用量统计(管理员)
       Query: ?startDate=&endDate=&groupBy=user|model|type
       Resp: { totalCalls, totalTokens, costEstimate, breakdown: [...] }

GET    /api/admin/ai/tasks                # AI任务调用日志
       Query: ?userId=&taskType=&status=&page=
       Resp: { total, tasks: [...] }
```

### 11.4 用户接口 (`/api/user/**`)

```
GET    /api/user/profile                 # 获取我的个人信息(含扩展)
       Auth: ✅
       Resp: { user, profile, levelInfo: { currentLv, nextLvExp, progress% } }

PUT    /api/user/profile                 # 更新个人资料
       Auth: ✅
       Body: { nickname?, bio?, location?, avatarUrl?, socialLinks?, skillsTags? ... }

GET    /api/user/:id/profile              # 查看他人公开资料
       Resp: { user: { id, nickname, avatarUrl, level, bio, ... }, isFollowed }

GET    /api/user/:id/posts                # 某用户的帖子列表
       Query: ?status=published&sort=latest&hot&page=

GET    /api/user/followers                # 我的粉丝列表
       Query: ?page=

GET    /api/user/followings               # 我的关注列表
       Query: ?page=

GET    /api/user/rankings                 # 用户排行榜(经验值/发帖数/获赞数)
       Query: ?type=experience|posts|likes&period=week|month|all&limit=50
```

### 11.5 消息通知接口 (`/api/message/**`)

```
GET    /api/message/notifications         # 通知列表
       Auth: ✅
       Query: ?type=all|interaction|system|ai&readStatus=all|unread|read&page=
       Resp: { total, unreadCount, list: [...] }

PUT    /api/message/:id/read               # 标记单条已读
       Auth: ✅

PUT    /api/message/read-all               # 全部标记已读
       Auth: ✅

GET    /api/message/unread-count           # 各类型未读数量
       Auth: ✅
       Resp: { total, interaction, system, ai }
```

### 11.6 实时聊天接口 (`/api/chat/**`)

```
# === 聊天室 ===
GET    /api/chat/rooms                 # 可用聊天室列表
       Auth: ✅
       Resp: [{ id, name, icon, description, memberCount }]

GET    /api/chat/rooms/:id/messages    # 群聊历史消息（游标分页）
       Auth: ✅
       Query: ?before=&limit=50
       Resp: { messages: [{ id, senderId, senderName, senderAvatar, content, msgType, createdAt }], hasMore }

# === 私聊 ===
GET    /api/chat/dm/contacts            # 最近私聊联系人
       Auth: ✅
       Resp: [{ userId, nickname, avatarUrl, lastMessage, lastTime, unreadCount }]

GET    /api/chat/dm/:userId/messages    # 私聊历史消息
       Auth: ✅
       Query: ?before=&limit=50
       Resp: { messages: [...], hasMore }

# === 内部接口 (ws-server 回调) ===
POST   /api/chat/messages               # 写入消息（内部接口，共享密钥认证）
       Body: { roomId?, senderId, receiverId?, content, msgType }
       Resp: { messageId }
```

#### 实时通信协议

连接方式：前端使用浏览器原生 `WebSocket` API，JSON 文本帧通信。

```ts
const ws = new WebSocket("ws://localhost:9000/ws/chat");

ws.onopen = () => {
  // 发送 AUTH 认证
  ws.send(JSON.stringify({
    type: "AUTH",
    payload: { userId: 1001, friendIds: [1002, 1003] }
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // 根据 msg.type 分发处理
};

ws.onclose = () => {
  // 断线重连逻辑
};
```

连接地址：`ws://localhost:9000/ws/chat`

**客户端 → 服务端消息**（JSON `type` 字段）：

| type | payload | 说明 |
|------|---------|------|
| `AUTH` | `{ userId: Long, friendIds?: [Long] }` | 绑定用户身份，上报好友列表 |
| `PING` | `null` | 心跳保活 |
| `JOIN_CHANNEL` | `{ channelId: Long }` | 加入频道 |
| `LEAVE_CHANNEL` | `{ channelId: Long }` | 离开频道 |
| `CHAT_MESSAGE` | `{ channelId: Long, content: String }` | 发送频道消息 |
| `DM_MESSAGE` | `{ targetUserId: Long, content: String }` | 发送私聊消息 |

**服务端 → 客户端消息**（JSON `type` 字段）：

| type | payload | 说明 |
|------|---------|------|
| `PONG` | ISO-8601 时间戳 | 心跳响应 |
| `CHAT_MESSAGE` | `{ channelId, senderSessionId, content, timestamp }` | 频道消息广播 |
| `DM_MESSAGE` | `{ senderSessionId, content, timestamp }` | 私聊消息 |
| `USER_JOINED` | `{ sessionId, channelId, onlineCount }` | 用户加入频道通知 |
| `USER_LEFT` | `{ sessionId, channelId, onlineCount }` | 用户离开频道通知 |
| `FRIEND_ONLINE` | `{ userId, timestamp }` | 好友上线通知 |
| `FRIEND_OFFLINE` | `{ userId, timestamp }` | 好友下线通知 |
| `ONLINE_FRIENDS` | `{ onlineFriendIds: [Long] }` | AUTH 后返回当前在线好友 |
| `ERROR` | 错误描述字符串 | 错误提示 |

---

## 十二、后端工程目录结构

所有微服务遵循统一的Kotlin + Spring Boot 4.0 + Jimmer工程目录规范：

```
linksee-parent/                          # 父POM工程(统一依赖版本管理)
│
├── linksee-api-gateway/                 # api-gateway 网关服务
├── linksee-auth-service/                # auth-service 认证服务
├── linksee-user-service/                # user-service 用户服务
├── linksee-forum-service/               # forum-service 论坛核心服务
├── linksee-ai-service/                  # ai-service AI智能服务
├── linksee-message-service/             # message-service 消息通知服务
│
├── linksee-common/                      # 公共模块(共享工具类/常量/枚举/异常)
├── linksee-feign-clients/               # Feign远程调用客户端定义
│
├── ws-server/                           # WebSocket 实时聊天服务 (Kotlin + Spring Boot WebFlux)
│   ├── src/main/kotlin/com/linksee/ws/
│   │   ├── WsServerApplication.kt       # Spring Boot 入口
│   │   ├── config/WebSocketConfig.kt    # WebSocket 路由配置
│   │   ├── handler/
│   │   │   └── WebSocketHandler.kt      # 消息处理 + 心跳
│   │   └── service/
│   │       └── RoomService.kt           # 房间/客户端/在线管理
│   └── src/main/resources/application.yml
│
├── backend-fastapi/                     # Python FastAPI 辅助后端
│
└── docs/                                # 项目文档
    ├── sql/                             # 数据库脚本
    ├── deployment/                      # 部署脚本
    └── api/                             # API文档
```

**单个微服务内部标准目录结构**：

```
linksee-xxx-service/
├── src/main/kotlin/com/linksee/xxx/
│   ├── application/                      # 应用编排层
│   │   ├── controller/                   # REST控制器(接收参数→调service)
│   │   ├── dto/                          # 入参DTO + 出参VO
│   │   └── convert/                      # DTO↔Entity转换映射器
│   │
│   ├── domain/                           # 领域核心层(纯业务逻辑)
│   │   ├── service/                      # 业务逻辑实现
│   │   ├── entity/                       # Jimmer实体定义
│   │   ├── repository/                   # Jimmer数据仓储接口
│   │   └── event/                        # 领域事件定义
│   │
│   ├── infrastructure/                   # 基础设施层
│   │   ├── config/                       # Spring/Jimmer/中间件配置
│   │   ├── cache/                        # Redis缓存操作封装
│   │   ├── es/                           # Elasticsearch操作封装
│   │   ├── mq/                           # RabbitMQ生产者/消费者
│   │   ├── ai/                           # 大模型API调用客户端
│   │   └── feign/                        # 远程服务调用
│   │
│   └── common/                           # 本服务私有工具/常量/枚举/异常
│
├── src/main/resources/
│   ├── application.yml                   # 默认配置
│   ├── application-dev.yml               # 开发环境
│   ├── application-prod.yml              # 生产环境
│   └── logback-spring.xml               # 日志配置
│
└── src/test/kotlin/                      # 单元测试 + 集成测试
```

**分层职责约束**：

| 层 | 可以做什么 | 禁止做什么 |
|----|-----------|-----------|
| **controller** | 参数校验、调用service、组装VO返回 | 编写业务逻辑、直接操作数据库 |
| **domain/service** | 纯业务逻辑、事务管理、领域规则 | 引入框架注解(@Autowired除外)、HTTP相关知识 |
| **entity** | 定义实体属性、关联关系、校验规则 | 包含业务方法(移至service) |
| **infrastructure** | 对接外部服务/中间件、技术细节实现 | 编写业务规则 |
| **common** | 本服务内的工具方法、常量定义 | 包含其他服务的业务概念 |

---

## 十三、安全与风控

### 13.1 认证与授权

- **认证方式**：JWT (JSON Web Token) + Refresh Token 双Token机制
  - AccessToken：有效期2小时，携带用户身份和权限信息
  - RefreshToken：有效期7天，用于静默刷新AccessToken，存储在HttpOnly Cookie中
- **密码安全**：BCrypt哈希加密，加盐存储，强度因子≥10
- **敏感接口**：关键操作（删除、修改权限等）二次验证（密码确认/短信验证码）

### 13.2 接口安全

| 安全措施 | 实现方式 | 覆盖范围 |
|----------|----------|----------|
| **XSS防护** | 前端输入过滤 + 后端输出转义 + Content-Security-Policy | 全局 |
| **CSRF防护** | SameSite Cookie + Token双重验证 | 状态变更接口 |
| **SQL注入** | Jimmer ORM参数化查询（天然免疫） | 全局 |
| **接口限流** | 网关层：IP维度滑动窗口；业务层：用户维度令牌桶 | 全局 |
| **防暴力破解** | 登录失败5次锁定15分钟 + 图形验证码 | 登录/注册接口 |
| **敏感数据脱敏** | 手机号/邮箱中间位掩码、日志中不记录明密 | 日志/响应 |

### 13.3 内容安全

- **敏感词系统**：本地敏感词库（DFA算法）+ 大模型AI审核双层过滤
- **AI审核流程**：发帖 → 本地敏感词初筛 → MQ异步AI深度审核 → 结果判定
- **审核结果处理**：
  - ✅ **通过**：正常展示
  - ⚠️ **疑似**：人工复审队列（版主/管理员处理）
  - ❌ **违规**：自动屏蔽 + 通知用户修改 + 记录违规次数（累计达到阈值临时封号）
- **图片审核**（V2）：接入第三方图片审核API（阿里云/腾讯云内容安全）

### 13.4 数据安全

- **传输加密**：全程HTTPS/TLS 1.3
- **存储加密**：敏感字段（密码、Token）加密存储；数据库连接SSL
- **备份策略**：PostgreSQL每日全量备份 + 实时WAL归档；保留30天
- **隐私合规**：用户可导出个人数据；注销账号后30天内彻底删除；符合最小必要原则

---

## 十四、分阶段迭代路线图

> 总周期：**6周** 完成 V1.0 版本并可上线运营

### Phase 1: 基础底座搭建（第1周）

**目标**：微服务骨架可运行，全链路连通，基础设施到位

| 序号 | 任务 | 详细内容 | 验收标准 |
|:---:|------|---------|---------|
| 1.1 | 工程初始化 | 创建父POM + 6个微服务Module + common公共模块，统一Spring Boot 4.0 + Kotlin + Jimmer版本 | `mvn clean compile` 通过 |
| 1.2 | 数据库搭建 | PostgreSQL建库建表（执行全部DDL），Jimmer实体逆向生成或手写完成 | 可通过Jimmer查询任意表 |
| 1.3 | Redis配置 | Redis连接池配置、缓存抽象基类封装、序列化策略(Kryo/String) | `SET/GET` 测试通过 |
| 1.4 | 网关配置 | SpringCloudGateway路由规则配置、全局Filter(鉴权/限流/日志/CORS) | 请求可达各微服务且返回正确 |
| 1.5 | 认证模块 | 用户注册(含密码加密)、JWT签发验签、登录登出完整流程 | 可注册新用户并登录获得Token |
| 1.6 | MQ配置 | RabbitMQ连接、Exchange/Queue声明、生产者消费者模板 | 可发送消息并被消费 |

**本周产出**：一个可以注册、登录、通过网关访问的系统骨架

---

### Phase 2: 论坛核心业务（第2-3周）

**目标**：论坛基础功能完整可用，用户可以正常发帖评论互动

| 序号 | 任务 | 详细内容 | 验收标准 |
|:---:|------|---------|---------|
| 2.1 | 用户中心 | 个人资料CRUD、头像上传(OSS/MinIO)、关注/取关、个人主页展示 | 完整用户体系可用 |
| 2.2 | 板块管理 | 一二级分类CRUD、板块列表/详情API、板块首页数据聚合 | 5大板块体系可浏览 |
| 2.3 | 发帖功能 | Markdown编辑器集成、帖子发布(含板块选择/标签)、帖子编辑/删除 | 可发布一篇完整帖子 |
| 2.4 | 评论系统 | 一级/二级嵌套评论、评论列表(分页/排序)、评论删除 | 帖子下可正常评论互动 |
| 2.5 | 互动功能 | 点赞/取消点赞、收藏/取消收藏、计数器实时更新(Redis原子操作) | 互动功能即时反馈 |
| 2.6 | 首页信息流 | 推荐/热门/最新/精华 Tab切换、帖子卡片列表、虚拟滚动 | 首页可流畅滚动浏览 |
| 2.7 | 基础搜索 | ES索引同步(MQ异步)、关键词全文检索、搜索结果高亮 | 输入关键词可搜到帖子 |
| 2.8 | 实时聊天 | ws-server (Kotlin/Spring WebFlux WebSocket) 服务搭建、聊天室群聊、用户私聊、消息落库、在线状态、前端 WebSocket ChatPage 页面 | 用户可实时群聊和私聊 |

**本周产出**：一个功能完整的论坛系统（不含AI功能）

---

### Phase 3: AI双引擎接入（第4-5周）

**目标**：AI能力上线，形成核心差异化竞争力

| 序号 | 任务 | 详细内容 | 验收标准 |
|:---:|------|---------|---------|
| 3.1 | 大模型接入 | 智谱GLM-4 SDK + 通义千问 SDK + Kimi SDK 接入，Model Router实现 | 可调用任一模型并获得回复 |
| 3.2 | 创作助手F01-F04 | 标题生成、大纲辅助、润色优化、续写扩写 4个核心功能 | 发帖编辑器内可使用AI辅助 |
| 3.3 | 创作助手F05-F08 | 翻译、摘要提炼、标签推荐、灵感激发 4个辅助功能 | AI工具栏8个功能全部可用 |
| 3.4 | RAG检索管线 | ES关键词检索 + Milvus向量检索 + PostgreSQL结构化查询并行执行 + 融合排序 | 混合检索可返回高质量结果 |
| 3.5 | AI问答界面 | 对话式UI(SSE流式输出)、引用来源展示、追问建议、会话管理 | 可与AI进行多轮问答 |
| 3.6 | MQ异步任务 | AI审核消费者、ES同步消费者、AI摘要生成、向量入库 | 发帖后异步流程全部跑通 |
| 3.7 | 用量控制 | 用户等级与每日配额校验、调用计数(Redis原子INCR)、超额提示 | 不同等级用户配额限制生效 |

**本周产出**：具备AI创作助手和AI智能问答两大核心能力的论坛

---

### Phase 4: 运营优化与上线准备（第6周）

**目标**：生产环境可部署，正式对外发布运营

| 序号 | 任务 | 详细内容 | 验收标准 |
|:---:|------|---------|---------|
| 4.1 | 内容审核 | DFA敏感词库 + AI违规检测 + 人工审核后台 | 违规内容可有效拦截 |
| 4.2 | 消息通知完善 | 站内信(点赞/评论/关注/系统/AI)、未读计数Badge | 消息及时准确送达 |
| 4.3 | 运营后台 | 用户管理(禁言/封号/角色)、帖子管理(置顶/精华/删除)、板块配置、数据看板 | 管理员可通过后台管控 |
| 4.4 | 性能优化 | 接口压测(JMeter/Gatling)、慢查询优化(EXPLAIN)、缓存命中率调优、SQL索引优化 | 核心接口P99 < 500ms |
| 4.5 | 安全加固 | XSS/CSRF防护、限流策略细化、接口权限全面审查、渗透测试基础检查 | 安全扫描无明显漏洞 |
| 4.6 | 文档与部署 | Swagger/OpenAPI文档完整、部署手册(Docker Compose/K8s)、运维脚本、监控告警(Prometheus+Grafana) | 其他人可按文档独立部署 |

**本周产出**：可正式上线的生产级系统

---

## 十五、商业化预留（V2.0方向）

> V1.0阶段专注社区运营和用户增长，暂不引入付费功能。
> 以下为未来商业化方向的预留设计考虑，确保架构可平滑演进。

| 方向 | 模式 | 预留设计 | 引入时机 |
|------|------|----------|----------|
| **会员订阅** | Freemium | 用户等级体系已预留VIP等级位；AI调用额度系统已实现；只需加支付模块 | DAU > 1000 且用户反馈积极 |
| **企业版** | SaaS租户 | 板块体系支持自定义创建；权限RBAC已完备；需加多租户隔离层 | 有企业主动咨询合作 |
| **广告系统** | 信息流广告 | 帖子列表Feed已支持插入式布局；用户画像数据已有基础 | 日活 > 5000 |
| **API开放平台** | 按调用量计费 | AI能力已封装为Service层；需加API Key管理 + 流量计费 | 外部开发者有接入需求 |
| **内容付费** | 专栏/课程 | 帖子系统已支持可见范围字段；需加订单/支付/分成模块 | 社区内有大V产生优质独家内容 |

---

## 附录

### A. 项目代号与命名规范

| 项目 | 说明 |
|------|------|
| 产品名称 | LinkSee 灵犀 |
| 项目代号 | NulkFourm（内部Git仓库名） |
| 包名前缀 | `com.linksee` |
| 数据库Schema | `linksee` |
| 缓存Key前缀 | `forum:` / `chat:` / `ai:` |
| MQ Exchange前缀 | `forum.exchange.` / `ai.exchange.` |
| Docker镜像前缀 | `linksee/` |

### B. 环境变量参考

```bash
# 数据库
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/linksee
SPRING_DATASOURCE_USERNAME=linksee
SPRING_DATASOURCE_PASSWORD=your_password

# Redis
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
SPRING_DATA_REDIS_PASSWORD=your_redis_password

# Elasticsearch
ELASTICSEARCH_HOSTS=http://localhost:9200

# Milvus
MILVUS_HOST=localhost
MILVUS_PORT=19530

# RabbitMQ
SPRING_RABBITMQ_HOST=localhost
SPRING_RABBITMQ_PORT=5672
SPRING_RABBITMQ_USERNAME=linksee
SPRING_RABBITMQ_PASSWORD=your_mq_password

# AI模型配置 (示例)
AI_MODEL_ZHIPU_API_KEY=zhipu_api_key_here
AI_MODEL_ZHIPU_API_SECRET=zhipu_secret_here
AI_MODEL_QIWEN_API_KEY=qwen_api_key_here
AI_MODEL_KIMI_API_KEY=kimi_api_key_here

# WebSocket 实时聊天 (Spring WebFlux Reactive WebSocket)
WS_PORT=9000
WS_HOST=0.0.0.0

# JWT
JWT_SECRET=your_jwt_secret_key_min_256bits
JWT_EXPIRATION_MS=7200000          # 2小时
JWT_REFRESH_EXPIRATION_MS=604800000 # 7天
```

### C. 技术选型决策记录 (ADR)

| 决策项 | 选择 | 备选方案 | 决策理由 |
|--------|------|---------|----------|
| 语言 | Kotlin | Java | 空安全、表达式简洁、与Java 100%互操作、代码量少30% |
| ORM | Jimmer | MyBatis-Plus / JPA | 无XML、强类型、动态SQL、PostgreSQL原生支持优秀 |
| 缓存 | Redis 7.0 | Memcached | 数据类型丰富、持久化、集群成熟、生态好 |
| 搜索 | ES 8.x | Meilisearch / Sphinx | 中文分词生态成熟、分布式能力强、查询DSL强大 |
| 向量库 | Milvus | Pinecone / Weaviate | 开源可自部署、性能优异、国内社区活跃 |
| 消息队列 | RabbitMQ | Kafka / RocketMQ | 管理友好、协议灵活、适合中小规模场景 |
| 前端 | React 19 + TS | Vue 3 / Nuxt | Hooks 生态成熟、组件化灵活、Vercel 最佳实践支持 |
| 实时通信 | 纯 WebSocket (Spring WebFlux Reactive) | Socket.IO / ws 库 | Spring 生态原生集成、Reactor 响应式模型、无额外协议开销 |

### D. 参考资源与致谢

- [React 官方文档](https://react.dev)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [TanStack Query 文档](https://tanstack.com/query)
- [Jimmer ORM 官方文档](https://babyfish-ct.github.io/jimmer/)
- [Spring Cloud Gateway 参考](https://docs.spring.io/spring-cloud-gateway/docs/current/reference/html/)
- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Milvus 官方文档](https://milvus.io/docs)
- [智谱AI开放平台](https://open.bigmodel.cn/)
- [通义千问API](https://help.aliyun.com/zh/model-studio/getting-started/models)
- [Kimi API](https://platform.moonshot.cn/docs)

---

> **文档版本**: v1.1
> **最后更新**: 2026-05-16
> **维护者**: LinkSee Team
> **状态**: ✅ 已批准，可作为开发实施依据
