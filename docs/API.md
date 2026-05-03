# LinkSee 灵犀 — 完整 API 接口文档

> **版本**: v1.0 | **最后更新**: 2026-05-04 | **基础路径**: `/api`

---

## 目录

- [1. 通用约定](#1-通用约定)
- [2. 认证接口 `/api/auth`](#2-认证接口)
- [3. 用户接口 `/api/user`](#3-用户接口)
- [4. 论坛接口 `/api/forum`](#4-论坛接口)
- [5. 搜索接口 `/api/search`](#5-搜索接口)
- [6. AI 能力接口 `/api/ai`](#6-ai-能力接口)
- [7. 消息通知接口 `/api/message`](#7-消息通知接口)
- [8. 后台管理接口 `/api/admin`](#8-后台管理接口)
- [附录：错误码 & 数据类型定义](#附录)

---

## 1. 通用约定

### 1.1 请求格式

- **Content-Type**: `application/json`（除文件上传外）
- **字符编码**: UTF-8
- **所有请求**必须通过网关 `api-gateway`，禁止直连微服务

### 1.2 认证方式

| 场景 | 方式 | Header |
|------|------|--------|
| 需登录接口 | JWT Bearer Token | `Authorization: Bearer <accessToken>` |
| 刷新令牌 | Refresh Token | `Cookie: refreshToken=<refreshToken>` (HttpOnly) |
| 公开接口 | 无需认证 | — |

**Token 生命周期**:
- AccessToken 有效期: **2 小时**
- RefreshToken 有效期: **7 天**

### 1.3 统一响应结构

```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1714800000000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | Integer | 业务状态码，`0` 表示成功，非 0 为错误 |
| `message` | String | 状态描述 |
| `data` | Object/String/Array/Null | 业务数据 |
| `timestamp` | Long | 服务器时间戳（毫秒） |

### 1.4 分页请求/响应

**请求参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `page` | Integer | 1 | 页码（从 1 开始） |
| `size` | Integer | 20 | 每页条数（最大 100） |
| `sortBy` | String | `latest` | 排序方式（视具体接口而定） |

**分页响应结构**:

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 150,
    "page": 1,
    "size": 20,
    "hasMore": true,
    "list": []
  }
}
```

### 1.5 权限级别标识

文档中使用以下标记说明接口权限:

| 标记 | 含义 |
|------|------|
| 🔓 公开 | 无需登录即可访问 |
| 🔐 登录 | 需要有效 JWT Token |
| 🛡️ 认证用户 | 需登录且用户等级 ≥ LV2（已认证） |
| 🔒 版主 | 需要版主及以上角色 |
| 🔑 管理员 | 需要管理员或超管角色 |

---

## 2. 认证接口

> **路由前缀**: `/api/auth` | **目标服务**: `auth-service` | **权限**: 🔓 公开（除登出/刷新外）

---

### 2.1 用户注册

```
POST /api/auth/register
```

**请求体**:

```json
{
  "username": "string (3-50字符, 必填)",
  "password": "string (8-32字符, 必填)",
  "email": "string (可选, 邮箱格式)",
  "phone": "string (可选, 手机号格式)",
  "captchaId": "string (必填, 验证码ID)",
  "captchaValue": "string (必填, 验证码值)"
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|:----:|----------|
| `username` | String | ✅ | 3-50 字符，字母/数字/下划线，唯一 |
| `password` | String | ✅ | 8-32 字符，需含大小写字母+数字 |
| `email` | String | ❌ | 合法邮箱格式，全局唯一 |
| `phone` | String | ❌ | 合法手机号格式（中国大陆），全局唯一 |
| `captchaId` | String | ✅ | 获取验证码时返回的 ID |
| `captchaValue` | String | ✅ | 用户输入的验证码 |

**响应**:

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": 100001,
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "rt_xxxxx",
    "expiresIn": 7200
  }
}
```

**错误码**: `40001` 用户名已存在 | `40002` 邮箱已注册 | `40003` 手机号已注册 | `40004` 验证码错误/过期

---

### 2.2 用户登录

```
POST /api/auth/login
```

**请求体**:

```json
{
  "username": "string (用户名/邮箱/手机号)",
  "password": "string",
  "captchaId": "string (连续失败5次后必填)",
  "captchaValue": "string (连续失败5次后必填)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `username` | String | ✅ | 支持用户名、邮箱、手机号登录 |
| `password` | String | ✅ | 明文密码 |
| `captchaId` | String | 条件 | 连续失败 5 次后必须 |
| `captchaValue` | String | 条件 | 连续失败 5 次后必须 |

**响应**:

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "userId": 100001,
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "rt_xxxxx",
    "expiresIn": 7200,
    "userInfo": {
      "id": 100001,
      "username": "zhangsan",
      "nickname": "张三",
      "avatarUrl": "https://cdn.linksee.com/avatars/100001.jpg",
      "level": 1,
      "experience": 0,
      "roles": ["ROLE_USER"]
    }
  }
}
```

**错误码**: `40010` 用户不存在 | `40011` 密码错误 | `40012` 账号已被禁用 | `40013` 验证码错误 | `40014` 账号已锁定（15分钟后重试）

---

### 2.3 用户登出

```
POST /api/auth/logout
```

**请求头**: `Authorization: Bearer <token>`

**响应**:

```json
{
  "code": 0,
  "message": "登出成功",
  "data": null
}
```

**说明**: 将当前 Token 加入黑名单，同时清除 RefreshToken

---

### 2.4 刷新 Token

```
POST /api/auth/refresh-token
```

**请求体**:

```json
{
  "refreshToken": "string"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "token刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...(新accessToken)",
    "refreshToken": "rt_yyyyy...(新refreshToken)",
    "expiresIn": 7200
  }
}
```

**错误码**: `40020` refreshToken 无效 | `40021` refreshToken 已过期

---

### 2.5 获取图形验证码

```
GET /api/auth/captcha
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "captchaId": "cap_abc123def456",
    "captchaImageBase64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

**说明**: 验证码 5 分钟内有效，使用后立即失效

---

## 3. 用户接口

> **路由前缀**: `/api/user` | **目标服务**: `user-service` | **权限**: 🔐 登录

---

### 3.1 获取我的个人信息

```
GET /api/user/profile
```

**权限**: 🔐 登录

**响应**:

```json
{
  "code": 0,
  "data": {
    "user": {
      "id": 100001,
      "username": "zhangsan",
      "nickname": "张三",
      "avatarUrl": "https://cdn.linksee.com/avatars/100001.jpg",
      "email": "z***n@example.com",
      "phone": "138****5678",
      "level": 3,
      "experience": 650,
      "status": 1,
      "createdAt": "2026-01-15T10:30:00+08:00"
    },
    "profile": {
      "bio": "全栈开发工程师，热爱开源",
      "location": "北京",
      "personalWebsite": "https://zhangsan.dev",
      "socialLinks": {
        "github": "https://github.com/zhangsan",
        "wechat": "zhangsan_dev"
      },
      "skillsTags": ["Kotlin", "Spring Boot", "Vue3", "PostgreSQL"],
      "education": "清华大学 · 计算机科学与技术",
      "occupation": "高级开发工程师",
      "isVerified": true,
      "followerCount": 256,
      "followingCount": 89
    },
    "levelInfo": {
      "currentLv": 3,
      "currentLvName": "社区达人",
      "currentLvExp": 650,
      "nextLvExp": 2000,
      "progress": 32.5,
      "nextLvName": "领域专家",
      "todayAiCallsRemaining": 8,
      "todayAiCallsTotal": 10
    }
  }
}
```

---

### 3.2 更新个人资料

```
PUT /api/user/profile
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "nickname": "string (可选, 1-50字符)",
  "bio": "string (可选, 最多500字)",
  "location": "string (可选)",
  "personalWebsite": "string (可选, URL格式)",
  "socialLinks": {
    "github": "string",
    "wechat": "string",
    "weibo": "string",
    "twitter": "string"
  },
  "skillsTags": ["string"],
  "education": "string (可选)",
  "occupation": "string (可选)"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "资料更新成功",
  "data": null
}
```

---

### 3.3 更新头像

```
POST /api/user/avatar
```

**权限**: 🔐 登录 | **Content-Type**: `multipart/form-data`

**请求体**: `file` — 图片文件（支持 JPG/PNG/WebP，最大 5MB）

**响应**:

```json
{
  "code": 0,
  "message": "头像更新成功",
  "data": {
    "avatarUrl": "https://cdn.linksee.com/avatars/100001_1714800000.jpg"
  }
}
```

---

### 3.4 查看他人公开资料

```
GET /api/user/:id/profile
```

**权限**: 🔐 登录

**路径参数**: `id` — 用户ID

**响应**:

```json
{
  "code": 0,
  "data": {
    "user": {
      "id": 100002,
      "nickname": "李四",
      "avatarUrl": "https://cdn.linksee.com/avatars/100002.jpg",
      "level": 4,
      "bio": "AI算法工程师 | 论坛活跃贡献者",
      "skillsTags": ["Python", "PyTorch", "LLM"],
      "occupation": "AI算法工程师",
      "isVerified": true,
      "followerCount": 1024,
      "followingCount": 56,
      "postCount": 89,
      "likeReceivedCount": 5678,
      "createdAt": "2025-08-20T14:00:00+08:00"
    },
    "isFollowed": false
  }
}
```

---

### 3.5 获取用户的帖子列表

```
GET /api/user/:id/posts
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `status` | String | `published` | `published` / `draft`（仅本人） |
| `sort` | String | `latest` | `latest` / `hot` |
| `page` | Integer | 1 | 页码 |
| `size` | Integer | 20 | 每页条数 |

**响应**: 标准分页结构，`list` 中为帖子摘要对象数组（同帖子列表接口）

---

### 3.6 获取我的粉丝列表

```
GET /api/user/followers
```

**权限**: 🔐 登录

**查询参数**: `page`, `size`

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 256,
    "hasMore": true,
    "list": [
      {
        "userId": 100003,
        "nickname": "王五",
        "avatarUrl": "...",
        "level": 2,
        "bio": "...",
        "isFollowed": true,
        "followedAt": "2026-03-10T08:00:00+08:00"
      }
    ]
  }
}
```

---

### 3.7 获取我的关注列表

```
GET /api/user/followings
```

**权限**: 🔐 登录 | **查询参数**: `page`, `size`

**响应**: 同粉丝列表结构

---

### 3.8 用户排行榜

```
GET /api/user/rankings
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | String | `experience` | `experience`(经验值) / `posts`(发帖数) / `likes`(获赞数) |
| `period` | String | `all` | `week` / `month` / `all` |
| `limit` | Integer | 50 | 返回数量（最大 100） |

**响应**:

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "rank": 1,
        "userId": 100002,
        "nickname": "李四",
        "avatarUrl": "...",
        "level": 5,
        "value": 8500,
        "badge": "⭐"
      }
    ]
  }
}
```

---

### 3.9 每日签到

```
POST /api/user/check-in
```

**权限**: 🔐 登录

**响应**:

```json
{
  "code": 0,
  "message": "签到成功！连续签到 3 天",
  "data": {
    "pointsEarned": 7,
    "consecutiveDays": 3,
    "totalPoints": 156
  }
}
```

**错误码**: `40101` 今日已签到

---

## 4. 论坛接口

> **路由前缀**: `/api/forum` | **目标服务**: `forum-service`

---

### 4.1 获取板块分类树

```
GET /api/forum/categories
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `includeStats` | Boolean | false | 是否包含帖子统计信息 |

**响应**:

```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "技术研发",
      "icon": "building",
      "description": "技术开发相关话题",
      "themeColor": "#1890ff",
      "postCount": 12580,
      "sortOrder": 1,
      "children": [
        {
          "id": 11,
          "name": "软件开发",
          "icon": "code",
          "description": "Java/Go/Rust/前端/移动开发",
          "postCount": 5230,
          "parentId": 1,
          "sortOrder": 1
        },
        {
          "id": 12,
          "name": "人工智能",
          "icon": "robot",
          "description": "LLM/计算机视觉/NLP/AI应用",
          "postCount": 4100,
          "parentId": 1,
          "sortOrder": 2
        }
      ]
    }
  ]
}
```

---

### 4.2 获取板块详情

```
GET /api/forum/category/:id
```

**权限**: 🔓 公开

**响应**:

```json
{
  "code": 0,
  "data": {
    "categoryInfo": {
      "id": 11,
      "name": "软件开发",
      "icon": "code",
      "description": "Java/Go/Rust/前端/移动开发",
      "themeColor": "#1890ff",
      "postCount": 5230,
      "postTemplate": {
        "fields": ["问题描述", "运行环境", "尝试方案", "期望结果"]
      },
      "aiPersona": "严谨的技术专家，擅长分析和解决编程问题"
    },
    "topPosts": [
      {
        "id": 5001,
        "title": "Spring Boot 4.0 新特性全面解析",
        "author": { "id": 100, "nickname": "...", "avatarUrl": "..." },
        "viewCount": 15200,
        "commentCount": 89,
        "publishedAt": "2026-04-20T10:00:00+08:00"
      }
    ],
    "essencePosts": [
      {
        "id": 5002,
        "title": "...",
        "author": { "id": 101, "nickname": "...", "avatarUrl": "..." },
        "viewCount": 8900,
        "commentCount": 45,
        "publishedAt": "2026-04-15T08:00:00+08:00"
      }
    ]
  }
}
```

---

### 4.3 发布帖子

```
POST /api/forum/post
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "categoryId": 11,
  "title": "string (1-200字符, 必填)",
  "content": "string (Markdown格式, 必填)",
  "tagList": ["Spring Boot", "Kotlin"],
  "coverImageUrl": "string (可选)"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `categoryId` | Long | ✅ | 目标板块 ID |
| `title` | String | ✅ | 1-200 字符 |
| `content` | String | ✅ | Markdown 正文，最大 50000 字符 |
| `tagList` | Array\<String\> | ❌ | 标签列表，最多 10 个 |
| `coverImageUrl` | String | ❌ | 封面图 URL |

**响应**:

```json
{
  "code": 0,
  "message": "发布成功",
  "data": {
    "postId": 100001,
    "status": 2,
    "message": "帖子已提交，正在审核中..."
  }
}
```

**说明**: 发布后帖子进入审核状态（`status=2`），审核通过后变为已发布（`status=1`）。AI 审核为异步流程。

**错误码**: `40201` 板块不存在 | `40202` 内容包含敏感词 | `40203` 今日发帖频率超限

---

### 4.4 获取帖子详情

```
GET /api/forum/post/:id
```

**权限**: 🔓 公开

**响应**:

```json
{
  "code": 0,
  "data": {
    "post": {
      "id": 100001,
      "title": "Spring Boot 4.0 新特性全面解析",
      "content": "# Spring Boot 4.0\n\n## 新特性概述\n...(Markdown正文)",
      "summary": "本文详细解析 Spring Boot 4.0 的核心新特性，包括原生编译支持、虚拟线程集成等...",
      "coverImageUrl": "https://cdn.linksee.com/covers/100001.jpg",
      "tagList": ["Spring Boot", "Kotlin", "Java"],
      "categoryId": 11,
      "categoryName": "软件开发",
      "viewCount": 15200,
      "likeCount": 389,
      "commentCount": 89,
      "collectCount": 156,
      "status": 1,
      "isTop": true,
      "isEssence": true,
      "authorId": 100002,
      "authorNickname": "李四",
      "authorAvatarUrl": "https://cdn.linksee.com/avatars/100002.jpg",
      "authorLevel": 4,
      "publishedAt": "2026-04-20T10:00:00+08:00",
      "createdAt": "2026-04-20T09:30:00+08:00"
    },
    "author": {
      "id": 100002,
      "nickname": "李四",
      "avatarUrl": "...",
      "level": 4,
      "bio": "AI算法工程师",
      "postCount": 89,
      "followerCount": 1024,
      "isFollowed": false
    },
    "aiData": {
      "aiSummary": "本文是一篇关于 Spring Boot 4.0 新特性的技术文章，重点介绍了原生编译和虚拟线程支持...",
      "aiKeywords": ["Spring Boot", "Java 21", "GraalVM", "Virtual Threads"],
      "qualityScore": 85,
      "estimatedReadTime": 8
    },
    "isLiked": false,
    "isCollected": true
  }
}
```

---

### 4.5 编辑帖子

```
PUT /api/forum/post/:id
```

**权限**: 🔐 登录（仅作者或管理员）

**请求体**:

```json
{
  "title": "string (可选)",
  "content": "string (可选)",
  "tagList": ["string"] ,
  "categoryId": 11,
  "coverImageUrl": "string (可选)"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "编辑成功",
  "data": {
    "postId": 100001
  }
}
```

**错误码**: `40210` 无权编辑 | `40211` 帖子不存在

---

### 4.6 删除帖子

```
DELETE /api/forum/post/:id
```

**权限**: 🔐 登录（仅作者或管理员）

**响应**:

```json
{
  "code": 0,
  "message": "删除成功",
  "data": null
}
```

**说明**: 逻辑删除，帖子状态变更为已删除。作者删除扣 20 积分。

---

### 4.7 帖子列表（分页）

```
GET /api/forum/posts
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `categoryId` | Long | — | 板块 ID，不传则查全站 |
| `sort` | String | `hot` | `hot`(综合热度) / `latest`(最新) / `essence`(精华) |
| `tag` | String | — | 按标签筛选 |
| `keyword` | String | — | 关键词搜索（简要搜索用） |
| `authorId` | Long | — | 按作者筛选 |
| `page` | Integer | 1 | 页码 |
| `size` | Integer | 20 | 每页条数 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 12580,
    "page": 1,
    "size": 20,
    "hasMore": true,
    "list": [
      {
        "id": 100001,
        "title": "Spring Boot 4.0 新特性全面解析",
        "summary": "本文详细解析 Spring Boot 4.0 的核心新特性...",
        "coverImageUrl": "...",
        "tagList": ["Spring Boot", "Kotlin"],
        "categoryId": 11,
        "categoryName": "软件开发",
        "viewCount": 15200,
        "likeCount": 389,
        "commentCount": 89,
        "collectCount": 156,
        "isTop": true,
        "isEssence": true,
        "author": {
          "id": 100002,
          "nickname": "李四",
          "avatarUrl": "...",
          "level": 4
        },
        "publishedAt": "2026-04-20T10:00:00+08:00"
      }
    ]
  }
}
```

---

### 4.8 发表评论

```
POST /api/forum/post/:postId/comment
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "content": "string (必填, 1-2000字符)",
  "parentId": 5001,
  "replyUserId": 100003
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `content` | String | ✅ | 评论内容 |
| `parentId` | Long | ❌ | 父评论 ID，不传为一级评论 |
| `replyUserId` | Long | ❌ | 被回复的用户 ID（二级评论时使用） |

**响应**:

```json
{
  "code": 0,
  "message": "评论成功",
  "data": {
    "commentId": 80001,
    "pointsEarned": 2
  }
}
```

---

### 4.9 获取评论列表

```
GET /api/forum/post/:postId/comments
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sortBy` | String | `latest` | `hot`(按热度) / `latest`(按时间) |
| `page` | Integer | 1 | 页码 |
| `size` | Integer | 20 | 每页条数 |
| `rootOnly` | Boolean | false | `true` 仅一级评论（前端分页加载子评论用） |

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 89,
    "hasMore": true,
    "list": [
      {
        "id": 80001,
        "content": "写得很详细，收藏了！",
        "likeCount": 15,
        "isLiked": false,
        "createdAt": "2026-04-20T12:00:00+08:00",
        "author": {
          "id": 100003,
          "nickname": "王五",
          "avatarUrl": "...",
          "level": 3
        },
        "replyTo": null,
        "childCount": 3,
        "children": [
          {
            "id": 80002,
            "content": "同感，受益匪浅",
            "likeCount": 5,
            "isLiked": true,
            "createdAt": "2026-04-20T12:30:00+08:00",
            "author": {
              "id": 100004,
              "nickname": "赵六",
              "avatarUrl": "...",
              "level": 2
            },
            "replyTo": {
              "userId": 100003,
              "nickname": "王五"
            },
            "childCount": 0,
            "children": []
          }
        ]
      }
    ]
  }
}
```

---

### 4.10 删除评论

```
DELETE /api/forum/comment/:id
```

**权限**: 🔐 登录（仅评论作者或管理员/版主）

**响应**:

```json
{
  "code": 0,
  "message": "评论已删除",
  "data": null
}
```

---

### 4.11 点赞/取消点赞

```
POST /api/forum/post/:postId/like
```

**权限**: 🔐 登录

**请求体**: 无

**响应**（Toggle 行为）:

```json
{
  "code": 0,
  "data": {
    "liked": true,
    "likeCount": 390
  }
}
```

| `liked` 值 | 说明 |
|:----------:|------|
| `true` | 本次操作为点赞，`likeCount` 为最新总数 |
| `false` | 本次操作为取消点赞 |

---

### 4.12 收藏/取消收藏

```
POST /api/forum/post/:postId/collect
```

**权限**: 🔐 登录

**请求体**: 无

**响应**（Toggle 行为）:

```json
{
  "code": 0,
  "data": {
    "collected": true,
    "collectCount": 157
  }
}
```

---

### 4.13 关注/取消关注

```
POST /api/forum/user/:userId/follow
```

**权限**: 🔐 登录

**请求体**: 无

**响应**（Toggle 行为）:

```json
{
  "code": 0,
  "data": {
    "followed": true,
    "followerCount": 1025
  }
}
```

---

### 4.14 获取我的收藏列表

```
GET /api/forum/user/favorites
```

**权限**: 🔐 登录

**查询参数**: `page`, `size`, `sortBy` (`latest` / `hot`)

**响应**: 标准分页结构，`list` 中为帖子摘要对象数组

---

## 5. 搜索接口

> **路由前缀**: `/api/search` | **目标服务**: `ai-service` | **权限**: 🔓 公开

---

### 5.1 全文搜索

```
GET /api/search
```

**权限**: 🔓 公开

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | String | — | 搜索关键词（必填） |
| `categoryId` | Long | — | 限定板块 |
| `tag` | String | — | 限定标签 |
| `sort` | String | `relevance` | `relevance`(相关性) / `latest`(最新) / `hot`(热度) |
| `page` | Integer | 1 | 页码 |
| `size` | Integer | 20 | 每页条数 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 156,
    "page": 1,
    "size": 20,
    "hasMore": true,
    "keyword": "Spring Boot",
    "list": [
      {
        "id": 100001,
        "title": "Spring Boot <em>4.0</em> 新特性全面解析",
        "summary": "本文详细解析 <em>Spring Boot</em> <em>4.0</em> 的核心新特性...",
        "tagList": ["Spring Boot", "Kotlin"],
        "categoryId": 11,
        "categoryName": "软件开发",
        "author": { "id": 100002, "nickname": "李四", "avatarUrl": "..." },
        "viewCount": 15200,
        "likeCount": 389,
        "commentCount": 89,
        "publishedAt": "2026-04-20T10:00:00+08:00",
        "highlight": {
          "title": "Spring Boot <em>4.0</em> 新特性全面解析",
          "summary": "...解析 <em>Spring Boot</em> <em>4.0</em> 的核心..."
        },
        "score": 12.5
      }
    ]
  }
}
```

---

### 5.2 热搜关键词

```
GET /api/search/hot
```

**权限**: 🔓 公开

**响应**:

```json
{
  "code": 0,
  "data": {
    "hotKeywords": [
      { "keyword": "Spring Boot 4.0", "heat": 8500 },
      { "keyword": "GLM-4 API", "heat": 6200 },
      { "keyword": "Kotlin 协程", "heat": 5100 },
      { "keyword": "Vue3 最佳实践", "heat": 4800 },
      { "keyword": "Milvus 入门", "heat": 3200 }
    ]
  }
}
```

---

### 5.3 搜索建议（自动补全）

```
GET /api/search/suggest
```

**权限**: 🔓 公开

**查询参数**: `q` — 输入前缀（至少 2 个字符）

**响应**:

```json
{
  "code": 0,
  "data": {
    "suggestions": [
      "Spring Boot 4.0",
      "Spring Boot 自动配置原理",
      "Spring Security OAuth2",
      "Spring Cloud Gateway"
    ]
  }
}
```

---

## 6. AI 能力接口

> **路由前缀**: `/api/ai` | **目标服务**: `ai-service` | **权限**: 🔐 登录

### AI 用量额度（按等级）

| 等级 | 每日免费总额度 |
|:----:|:------------:|
| LV1 | 3 次 |
| LV2 | 5 次 |
| LV3 | 10 次 |
| LV4 | 20 次 |
| LV5 | 无限制 |
| LV6 | 无限制 + 优先 |

---

### 6.1 F01: 智能标题生成

```
POST /api/ai/create/title-generate
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "content": "string (正文内容或关键词描述, 必填)",
  "categoryId": 11,
  "style": "technical"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `content` | String | ✅ | 正文内容或话题描述 |
| `categoryId` | Long | ❌ | 所属板块，用于生成贴合板块风格的标题 |
| `style` | String | ❌ | `technical`(技术向) / `question`(提问向) / `story`(故事向) / `data`(数据向) / `suspense`(悬念向)，默认综合 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_abc123",
    "titles": [
      { "text": "Spring Boot 4.0 原生编译实战：从入门到生产部署", "style": "technical" },
      { "text": "为什么说 Spring Boot 4.0 是 Java 开发的里程碑？", "style": "question" },
      { "text": "从 Spring Boot 3.x 到 4.0：一个团队的技术升级之路", "style": "story" },
      { "text": "5 个数据告诉你 Spring Boot 4.0 有多快", "style": "data" },
      { "text": "Spring Boot 4.0 暗藏的这个特性，90% 的开发者都不知道", "style": "suspense" }
    ]
  }
}
```

---

### 6.2 F02: 大纲辅助

```
POST /api/ai/create/outline-assist
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "topic": "string (话题主题, 必填)",
  "categoryId": 11,
  "detailLevel": "standard"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `topic` | String | ✅ | 文章主题 |
| `categoryId` | Long | ❌ | 所属板块 |
| `detailLevel` | String | ❌ | `brief`(简要) / `standard`(标准) / `detailed`(详细)，默认 `standard` |

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_def456",
    "outline": {
      "title": "Spring Boot 4.0 新特性全面解析",
      "sections": [
        {
          "heading": "一、背景与动机",
          "suggestedWords": 300,
          "points": ["Java 21 LTS 的里程碑意义", "云原生趋势下的框架演进"]
        },
        {
          "heading": "二、核心新特性详解",
          "suggestedWords": 2000,
          "points": ["2.1 原生编译 (GraalVM) 支持", "2.2 虚拟线程集成", "2.3 全新自动配置机制"]
        },
        {
          "heading": "三、实战演示",
          "suggestedWords": 1500,
          "points": ["3.1 创建原生编译项目", "3.2 性能对比测试"]
        }
      ]
    }
  }
}
```

---

### 6.3 F03: 智能润色优化

```
POST /api/ai/create/polish-optimize
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "text": "string (待润色文本, 必填)",
  "intensity": "medium",
  "targetStyle": "formal"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `text` | String | ✅ | 需要润色的文本段落 |
| `intensity` | String | ❌ | `light`(轻度) / `medium`(中度) / `heavy`(深度) |
| `targetStyle` | String | ❌ | `formal`(正式) / `casual`(轻松) / `academic`(学术) / `story`(叙事) |

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_ghi789",
    "polishedText": "Spring Boot 4.0 引入了多项重大改进，其中包括对 GraalVM 原生编译的一流支持...",
    "diffHighlight": [
      {
        "original": "spring boot 4.0 加了好多新东西，比如 graalvm",
        "modified": "Spring Boot 4.0 引入了多项重大改进，其中包括对 GraalVM 原生编译的一流支持"
      }
    ]
  }
}
```

---

### 6.4 F04: 智能续写扩写

```
POST /api/ai/create/continue-write
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "context": "string (光标前的上下文内容, 必填)",
  "mode": "detail",
  "maxLength": 500
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `context` | String | ✅ | 当前光标前的文本上下文 |
| `mode` | String | ❌ | `detail`(细节展开) / `argument`(论证延伸) / `counterpoint`(反面观点) / `extend`(扩展延伸) |
| `maxLength` | Integer | ❌ | 生成文本最大长度，默认 500，最大 2000 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_jkl012",
    "continuedText": "在实际使用中，GraalVM 原生编译可以将 Spring Boot 应用的启动时间从数十秒缩短到毫秒级别。根据官方基准测试..."
  }
}
```

---

### 6.5 F05: 多语言翻译

```
POST /api/ai/create/translate
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "text": "string (待翻译文本, 必填)",
  "targetLang": "en"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `text` | String | ✅ | 待翻译的文本 |
| `targetLang` | String | ✅ | 目标语言: `en`(英语) / `ja`(日语) / `ko`(韩语) / `fr`(法语) / `de`(德语) |

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_mno345",
    "translatedText": "Spring Boot 4.0 introduces several major improvements, including first-class support for GraalVM native compilation...",
    "detectedLang": "zh"
  }
}
```

---

### 6.6 F06: 摘要提炼

```
POST /api/ai/create/summary-extract
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "content": "string (完整文章内容, 必填)",
  "maxLength": 200
}
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "task_pqr678",
    "summary": "本文系统解析了 Spring Boot 4.0 的核心新特性，包括 GraalVM 原生编译支持、虚拟线程集成、全新自动配置机制等，并通过实战演示展示其性能优势。",
    "keywords": [
      { "word": "Spring Boot 4.0", "weight": 0.95 },
      { "word": "GraalVM", "weight": 0.82 },
      { "word": "虚拟线程", "weight": 0.75 },
      { "word": "原生编译", "weight": 0.71 },
      { "word": "性能优化", "weight": 0.60 }
    ]
  }
}
```

---

### 6.7 F07: 智能标签推荐

```
POST /api/ai/create/tag-recommend
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "title": "string (文章标题, 必填)",
  "content": "string (文章正文, 必填)",
  "categoryId": 11,
  "limit": 10
}
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "tag_rec_001",
    "tags": [
      { "name": "Spring Boot", "confidence": 0.95 },
      { "name": "Java 21", "confidence": 0.88 },
      { "name": "GraalVM", "confidence": 0.82 },
      { "name": "虚拟线程", "confidence": 0.76 },
      { "name": "性能优化", "confidence": 0.65 }
    ]
  }
}
```

---

### 6.8 F08: 灵感激发

```
POST /api/ai/create/inspire
```

**权限**: 🔐 登录

**请求体**:

```json
{
  "topic": "string (话题主题, 必填)",
  "categoryId": 11,
  "count": 5
}
```

**响应**:

```json
{
  "code": 0,
  "data": {
    "taskId": "inspire_001",
    "inspirations": [
      {
        "angle": "性能对比视角",
        "suggestion": "可以将 Spring Boot 4.0 与 3.x 在启动时间、内存占用、吞吐量三个维度做 Benchmark 对比",
        "example": "测试环境：MacBook Pro M3, 16GB RAM, JDK 21..."
      },
      {
        "angle": "实战踩坑视角",
        "suggestion": "记录从 3.x 迁移到 4.0 过程中遇到的兼容性问题和解决方案",
        "example": "问题1：HikariCP 升级导致连接池配置方式变更..."
      }
    ]
  }
}
```

---

### 6.9 AI 智能问答 - 发送问题（RAG）

```
POST /api/ai/chat/send
```

**权限**: 🛡️ 认证用户（LV2 及以上）

**请求体**:

```json
{
  "question": "string (用户问题, 必填)",
  "sessionId": "string (会话ID, 可选, 不传则创建新会话)",
  "contextPostId": 100001,
  "stream": true
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `question` | String | ✅ | 用户提出的问题 |
| `sessionId` | String | ❌ | 续接已有会话，不传则新建 |
| `contextPostId` | Long | ❌ | 关联的帖子 ID，限定在该帖子上下文中回答 |
| `stream` | Boolean | ❌ | 是否使用 SSE 流式输出，默认 `true` |

**流式响应 (SSE)**:

```
Content-Type: text/event-stream

data: {"type":"thinking","content":"正在检索相关帖子..."}

data: {"type":"sources","items":[{"postId":100001,"title":"Spring Boot 4.0 新特性","authorName":"李四","relevance":0.92},{"postId":100050,"title":"GraalVM 实战指南","authorName":"王五","relevance":0.85}]}

data: {"type":"content","delta":"根据社区中的相关讨论，Spring Boot 4.0 "}

data: {"type":"content","delta":"主要带来了以下几项重要改进：\n\n1. "}

data: {"type":"content","delta":"**原生编译支持**：通过与 GraalVM 深度集成..."}

data: {"type":"followups","suggestions":["Spring Boot 4.0 如何配置 GraalVM？","虚拟线程在实际项目中有什么注意事项？","从 3.x 迁移到 4.0 需要注意什么？"]}

data: {"type":"done","sessionId":"sess_abc123","tokensUsed":{"input":520,"output":380}}
```

**非流式响应**:

```json
{
  "code": 0,
  "data": {
    "sessionId": "sess_abc123",
    "answer": "根据社区中的相关讨论，Spring Boot 4.0 主要带来了以下几项重要改进：\n\n1. **原生编译支持**...\n\n> 来源: [Spring Boot 4.0 新特性全面解析](/post/100001) — 作者: 李四\n> 来源: [GraalVM 实战指南](/post/100050) — 作者: 王五",
    "sources": [
      { "postId": 100001, "title": "Spring Boot 4.0 新特性", "authorName": "李四", "relevance": 0.92 },
      { "postId": 100050, "title": "GraalVM 实战指南", "authorName": "王五", "relevance": 0.85 }
    ],
    "followups": ["Spring Boot 4.0 如何配置 GraalVM？", "虚拟线程在实际项目中有什么注意事项？"],
    "tokensUsed": { "input": 520, "output": 380 }
  }
}
```

**错误码**: `40301` 今日 AI 额度已用完 | `40302` AI 服务暂时不可用 | `40303` 用户等级不足（需 LV2）

---

### 6.10 获取对话历史列表

```
GET /api/ai/chat/sessions
```

**权限**: 🛡️ 认证用户

**查询参数**: `page`, `size`

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 15,
    "sessions": [
      {
        "id": "sess_abc123",
        "title": "Spring Boot 4.0 新特性相关讨论",
        "lastMessageAt": "2026-04-20T15:30:00+08:00",
        "messageCount": 8,
        "firstQuestion": "Spring Boot 4.0 有哪些新特性？"
      }
    ]
  }
}
```

---

### 6.11 获取会话消息记录

```
GET /api/ai/chat/session/:sessionId/messages
```

**权限**: 🛡️ 认证用户

**响应**:

```json
{
  "code": 0,
  "data": {
    "messages": [
      {
        "role": "user",
        "content": "Spring Boot 4.0 有哪些新特性？",
        "createdAt": "2026-04-20T15:00:00+08:00"
      },
      {
        "role": "assistant",
        "content": "根据社区讨论，Spring Boot 4.0 主要改进包括...",
        "sources": [
          { "postId": 100001, "title": "...", "authorName": "李四" }
        ],
        "createdAt": "2026-04-20T15:00:05+08:00"
      }
    ]
  }
}
```

---

### 6.12 删除会话

```
DELETE /api/ai/chat/session/:sessionId
```

**权限**: 🛡️ 认证用户

**响应**:

```json
{
  "code": 0,
  "message": "会话已删除",
  "data": null
}
```

---

### 6.13 获取 AI 剩余额度

```
GET /api/ai/usage/quota
```

**权限**: 🔐 登录

**响应**:

```json
{
  "code": 0,
  "data": {
    "dailyLimit": 10,
    "dailyUsed": 3,
    "dailyRemaining": 7,
    "level": 3,
    "levelName": "社区达人",
    "unlimited": false
  }
}
```

---

### 6.14 AI 问答反馈

```
POST /api/ai/chat/feedback
```

**权限**: 🛡️ 认证用户

**请求体**:

```json
{
  "sessionId": "string (会话ID)",
  "messageId": "string (AI回答消息ID)",
  "rating": "helpful",
  "comment": "string (可选, 用户补充说明)"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `sessionId` | String | ✅ | 会话 ID |
| `messageId` | String | ✅ | AI 回答消息 ID |
| `rating` | String | ✅ | `helpful`(有帮助) / `unhelpful`(无帮助) |
| `comment` | String | ❌ | 用户补充反馈 |

---

## 7. 消息通知接口

> **路由前缀**: `/api/message` | **目标服务**: `message-service` | **权限**: 🔐 登录

---

### 7.1 获取通知列表

```
GET /api/message/notifications
```

**权限**: 🔐 登录

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | String | `all` | `all` / `interaction`(互动) / `system`(系统) / `ai`(AI相关) |
| `readStatus` | String | `all` | `all` / `unread` / `read` |
| `page` | Integer | 1 | 页码 |
| `size` | Integer | 20 | 每页条数 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 35,
    "unreadCount": 8,
    "list": [
      {
        "id": 90001,
        "type": "interaction",
        "subType": "like",
        "title": "李四 赞了你的帖子",
        "content": "\"Spring Boot 4.0 新特性全面解析\"",
        "targetType": "post",
        "targetId": 100001,
        "triggerUserId": 100002,
        "triggerUserNickname": "李四",
        "triggerUserAvatarUrl": "...",
        "isRead": false,
        "createdAt": "2026-04-20T15:00:00+08:00"
      },
      {
        "id": 90002,
        "type": "interaction",
        "subType": "comment",
        "title": "王五 评论了你的帖子",
        "content": "写得很详细，收藏了！",
        "targetType": "comment",
        "targetId": 80001,
        "postId": 100001,
        "triggerUserId": 100003,
        "triggerUserNickname": "王五",
        "triggerUserAvatarUrl": "...",
        "isRead": false,
        "createdAt": "2026-04-20T14:30:00+08:00"
      },
      {
        "id": 90003,
        "type": "system",
        "subType": "notice",
        "title": "系统通知",
        "content": "你的帖子已被管理员设为精华帖，+20 积分奖励",
        "isRead": true,
        "createdAt": "2026-04-20T10:00:00+08:00"
      },
      {
        "id": 90004,
        "type": "ai",
        "subType": "moderation",
        "title": "AI 审核结果",
        "content": "你的帖子《xxx》已通过审核",
        "isRead": false,
        "createdAt": "2026-04-20T09:35:00+08:00"
      }
    ]
  }
}
```

---

### 7.2 标记单条已读

```
PUT /api/message/:id/read
```

**权限**: 🔐 登录

**响应**:

```json
{
  "code": 0,
  "message": "已标记已读",
  "data": null
}
```

---

### 7.3 全部标记已读

```
PUT /api/message/read-all
```

**权限**: 🔐 登录

**请求体**（可选，按类型批量标记）:

```json
{
  "type": "interaction"
}
```

**响应**:

```json
{
  "code": 0,
  "message": "全部已读",
  "data": { "markedCount": 8 }
}
```

---

### 7.4 获取未读数量

```
GET /api/message/unread-count
```

**权限**: 🔐 登录

**响应**:

```json
{
  "code": 0,
  "data": {
    "total": 8,
    "interaction": 5,
    "system": 2,
    "ai": 1
  }
}
```

---

## 8. 后台管理接口

> **路由前缀**: `/api/admin` | **目标服务**: 多服务聚合 | **权限**: 🔑 管理员

---

### 8.1 数据概览仪表盘

```
GET /api/admin/dashboard
```

**权限**: 🔑 管理员

**响应**:

```json
{
  "code": 0,
  "data": {
    "overview": {
      "totalUsers": 15680,
      "newUsersToday": 45,
      "totalPosts": 52300,
      "newPostsToday": 128,
      "totalComments": 189000,
      "newCommentsToday": 890,
      "activeUsers7d": 3560,
      "aiCallsToday": 2450
    },
    "trendPosts": [
      { "date": "2026-04-14", "count": 110 },
      { "date": "2026-04-15", "count": 125 },
      { "date": "2026-04-16", "count": 98 }
    ],
    "trendUsers": [
      { "date": "2026-04-14", "count": 38 },
      { "date": "2026-04-15", "count": 42 },
      { "date": "2026-04-16", "count": 45 }
    ],
    "hotPosts": [],
    "recentModerations": []
  }
}
```

---

### 8.2 用户管理

#### 获取用户列表

```
GET /api/admin/users
```

**权限**: 🔑 管理员

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `keyword` | String | 搜索用户名/昵称/邮箱 |
| `status` | Integer | `1`(正常) / `0`(禁用) |
| `level` | Integer | 用户等级 1-6 |
| `role` | String | 角色过滤 |
| `page`, `size` | Integer | 分页 |

**响应**: 标准分页结构，`list` 中为用户完整信息对象

#### 更新用户状态（禁言/封号）

```
PUT /api/admin/users/:userId/status
```

**权限**: 🔑 管理员

**请求体**:

```json
{
  "status": 0,
  "reason": "string (封禁原因)"
}
```

| `status` 值 | 说明 |
|:----------:|------|
| 1 | 正常 |
| 0 | 永久封禁 |
| 2 | 临时禁言（需配合 `muteUntil`） |

**请求体（禁言）**:

```json
{
  "status": 2,
  "reason": "违反社区规范",
  "muteUntil": "2026-04-25T00:00:00+08:00"
}
```

---

#### 分配用户角色

```
PUT /api/admin/users/:userId/roles
```

**权限**: 🔑 超级管理员

**请求体**:

```json
{
  "roles": ["ROLE_USER", "ROLE_MODERATOR"],
  "moderatorCategories": [11, 12]
}
```

**说明**: 分配 `ROLE_MODERATOR` 时可指定管理的板块 ID 列表

---

### 8.3 帖子管理

#### 管理员帖子列表

```
GET /api/admin/posts
```

**权限**: 🔑 管理员

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `status` | Integer | `0`(草稿) / `1`(已发布) / `2`(审核中) / `3`(违规) |
| `categoryId` | Long | 板块筛选 |
| `authorId` | Long | 作者筛选 |
| `keyword` | String | 关键词搜索 |
| `page`, `size` | Integer | 分页 |

---

#### 帖子审核操作

```
POST /api/admin/posts/:postId/moderate
```

**权限**: 🔒 版主 / 🔑 管理员

**请求体**:

```json
{
  "action": "approve",
  "reason": "string"
}
```

| `action` 值 | 说明 |
|:----------:|------|
| `approve` | 审核通过 |
| `reject` | 审核不通过（退回修改） |
| `violate` | 标记违规（隐藏帖子） |

---

#### 帖子置顶/精华操作

```
PUT /api/admin/posts/:postId/feature
```

**权限**: 🔒 版主 / 🔑 管理员

**请求体**:

```json
{
  "isTop": true,
  "topExpireAt": "2026-04-30T00:00:00+08:00",
  "isEssence": true,
  "essenceReason": "技术深度好，实用性高"
}
```

---

### 8.4 板块管理

#### 创建/编辑板块

```
POST /api/admin/categories
PUT /api/admin/categories/:id
```

**权限**: 🔑 管理员

**请求体**:

```json
{
  "name": "string",
  "icon": "string",
  "parentId": 1,
  "description": "string",
  "sortOrder": 1,
  "themeColor": "#1890ff",
  "postTemplate": {
    "fields": ["问题描述", "运行环境", "尝试方案"]
  },
  "aiPersona": "string",
  "status": 1
}
```

---

#### 删除板块

```
DELETE /api/admin/categories/:id
```

**权限**: 🔑 管理员

---

### 8.5 AI 用量统计

```
GET /api/admin/ai/usage/stats
```

**权限**: 🔑 管理员

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `startDate` | String | 起始日期 `yyyy-MM-dd` |
| `endDate` | String | 结束日期 `yyyy-MM-dd` |
| `groupBy` | String | `user` / `model` / `type` |

**响应**:

```json
{
  "code": 0,
  "data": {
    "totalCalls": 45600,
    "totalTokensInput": 12800000,
    "totalTokensOutput": 8600000,
    "costEstimate": 1256.80,
    "avgResponseTimeMs": 1850,
    "breakdown": [
      { "groupBy": "TITLE_GENERATE", "calls": 12000, "avgTokens": 520 },
      { "groupBy": "QA_CHAT", "calls": 23000, "avgTokens": 1200 },
      { "groupBy": "POLISH_OPTIMIZE", "calls": 5600, "avgTokens": 380 },
      { "groupBy": "OUTLINE_ASSIST", "calls": 3000, "avgTokens": 650 },
      { "groupBy": "SUMMARY_EXTRACT", "calls": 2000, "avgTokens": 480 }
    ]
  }
}
```

---

### 8.6 AI 任务调用日志

```
GET /api/admin/ai/tasks
```

**权限**: 🔑 管理员

**查询参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `userId` | Long | 用户筛选 |
| `taskType` | String | 任务类型 |
| `status` | Integer | `0`(进行中) / `1`(成功) / `2`(失败) / `3`(超时) |
| `page`, `size` | Integer | 分页 |

---

## 附录

### A. 错误码一览表

| 错误码 | HTTP 状态码 | 说明 |
|:------:|:----------:|------|
| **0** | 200 | 成功 |
| **40000** | 400 | 请求参数错误 |
| **40001** | 409 | 用户名已存在 |
| **40002** | 409 | 邮箱已注册 |
| **40003** | 409 | 手机号已注册 |
| **40004** | 400 | 验证码错误或过期 |
| **40010** | 401 | 用户不存在 |
| **40011** | 401 | 密码错误 |
| **40012** | 403 | 账号已被禁用 |
| **40013** | 400 | 验证码错误 |
| **40014** | 429 | 账号已锁定 |
| **40020** | 401 | refreshToken 无效 |
| **40021** | 401 | refreshToken 已过期 |
| **40100** | 401 | 未登录或 Token 无效 |
| **40101** | 200 | 业务逻辑提示（今日已签到等） |
| **40102** | 403 | 权限不足 |
| **40103** | 403 | 账号状态异常（禁言/封禁） |
| **40201** | 404 | 板块不存在 |
| **40202** | 400 | 内容包含敏感词 |
| **40203** | 429 | 发帖频率超限 |
| **40210** | 403 | 无权编辑（非作者/非管理员） |
| **40211** | 404 | 帖子不存在 |
| **40301** | 429 | AI 额度已用完 |
| **40302** | 503 | AI 服务暂不可用 |
| **40303** | 403 | 用户等级不足 |
| **40401** | 404 | 资源不存在 |
| **50000** | 500 | 服务器内部错误 |
| **50001** | 504 | 第三方服务超时 |
| **50002** | 502 | 第三方服务不可用 |

### B. 通用数据类型

#### UserInfo（用户信息摘要）

```json
{
  "id": 100001,
  "username": "zhangsan",
  "nickname": "张三",
  "avatarUrl": "https://cdn.linksee.com/avatars/100001.jpg",
  "level": 3
}
```

#### PostSummary（帖子摘要）

```json
{
  "id": 100001,
  "title": "帖子标题",
  "summary": "帖子摘要",
  "coverImageUrl": "...",
  "tagList": ["标签1"],
  "categoryId": 11,
  "categoryName": "软件开发",
  "viewCount": 100,
  "likeCount": 50,
  "commentCount": 20,
  "collectCount": 10,
  "isTop": false,
  "isEssence": false,
  "author": { "id": 100, "nickname": "...", "avatarUrl": "...", "level": 3 },
  "publishedAt": "2026-04-20T10:00:00+08:00"
}
```

### C. 状态码枚举

#### 帖子状态 (forum_post.status)

| 值 | 说明 |
|:--:|------|
| 0 | 草稿 |
| 1 | 已发布 |
| 2 | 审核中 |
| 3 | 违规 |

#### 用户状态 (sys_user.status)

| 值 | 说明 |
|:--:|------|
| 0 | 禁用/封禁 |
| 1 | 正常 |
| 2 | 临时禁言 |

#### 用户等级 (sys_user.level)

| 值 | 名称 | 经验值要求 |
|:--:|------|:---------:|
| 1 | 萌新小白 | 0 |
| 2 | 活跃新人 | 100 |
| 3 | 社区达人 | 500 |
| 4 | 领域专家 | 2000 |
| 5 | 灵犀之星 | 5000 |
| 6 | 社区领袖 | 10000+ |

#### AI 任务类型 (ai_task_record.task_type)

| 值 | 说明 |
|-----|------|
| `TITLE_GENERATE` | 标题生成 |
| `OUTLINE_ASSIST` | 大纲辅助 |
| `POLISH_OPTIMIZE` | 润色优化 |
| `CONTINUE_WRITE` | 续写扩写 |
| `TRANSLATE` | 多语言翻译 |
| `SUMMARY_EXTRACT` | 摘要提炼 |
| `TAG_RECOMMEND` | 标签推荐 |
| `INSPIRE` | 灵感激发 |
| `QA_CHAT` | AI 问答 |
| `CONTENT_MODERATION` | 内容审核 |
| `AUTO_SUMMARY` | 自动摘要生成 |

#### AI 任务状态 (ai_task_record.status)

| 值 | 说明 |
|:--:|------|
| 0 | 进行中 |
| 1 | 成功 |
| 2 | 失败 |
| 3 | 超时 |

---

> **文档版本**: v1.0
> **最后更新**: 2026-05-04
> **维护者**: LinkSee Team
> **状态**: 可作为前后端开发实施依据
