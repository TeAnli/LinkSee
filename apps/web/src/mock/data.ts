import i18n from '@/i18n';
import type { PostListItem, PostDetail, Category, UserInfo } from '@linksee/shared';

// === Mock Users ===

export const mockUsers = [
  { id: 1, nickname: '林小白', avatarUrl: '', level: 5 },
  { id: 2, nickname: '代码猎人', avatarUrl: '', level: 4 },
  { id: 3, nickname: '技术小白兔', avatarUrl: '', level: 2 },
  { id: 4, nickname: '全栈阿杰', avatarUrl: '', level: 3 },
  { id: 5, nickname: 'DevCat', avatarUrl: '', level: 6 },
  { id: 6, nickname: '前端菜鸡', avatarUrl: '', level: 1 },
  { id: 7, nickname: '云端漫步', avatarUrl: '', level: 4 },
  { id: 8, nickname: 'AI探索者', avatarUrl: '', level: 3 },
] as const satisfies readonly Pick<UserInfo, 'id' | 'nickname' | 'avatarUrl' | 'level'>[];

// === Mock Tags ===

export const mockTags: { name: string; count: number }[] = [
  { name: 'Spring Boot', count: 156 },
  { name: 'React', count: 134 },
  { name: 'TypeScript', count: 128 },
  { name: 'Vue.js', count: 112 },
  { name: 'Docker', count: 98 },
  { name: '微服务', count: 87 },
  { name: 'Java', count: 82 },
  { name: 'AI', count: 76 },
  { name: 'Kubernetes', count: 65 },
  { name: 'MySQL', count: 63 },
  { name: 'Redis', count: 58 },
  { name: 'PostgreSQL', count: 51 },
  { name: 'Go', count: 48 },
  { name: 'Rust', count: 42 },
  { name: '前端', count: 40 },
  { name: 'Node.js', count: 38 },
  { name: '算法', count: 35 },
  { name: 'Linux', count: 33 },
  { name: '性能优化', count: 28 },
  { name: '大模型', count: 25 },
];

// === Mock Categories ===

export const mockCategories: Category[] = [
  {
    id: 1,
    name: '技术交流',
    icon: 'mdi:code-braces',
    parentId: null,
    description: '分享技术心得、讨论技术难题',
    sortOrder: 1,
    postCount: 342,
    themeColor: '#3B82F6',
    children: [
      {
        id: 11,
        name: '后端开发',
        icon: 'mdi:server',
        parentId: 1,
        description: 'Java、Go、Python 等后端技术讨论',
        sortOrder: 1,
        postCount: 156,
        themeColor: '#3B82F6',
      },
      {
        id: 12,
        name: '前端开发',
        icon: 'mdi:monitor-cellphone',
        parentId: 1,
        description: 'React、Vue、CSS 等前端技术',
        sortOrder: 2,
        postCount: 134,
        themeColor: '#3B82F6',
      },
      {
        id: 13,
        name: '移动开发',
        icon: 'mdi:cellphone',
        parentId: 1,
        description: 'iOS、Android、Flutter、React Native',
        sortOrder: 3,
        postCount: 52,
        themeColor: '#3B82F6',
      },
    ],
  },
  {
    id: 2,
    name: 'AI & 机器学习',
    icon: 'mdi:robot',
    parentId: null,
    description: '人工智能、深度学习、大模型讨论',
    sortOrder: 2,
    postCount: 218,
    themeColor: '#8B5CF6',
    children: [
      {
        id: 21,
        name: '大模型应用',
        icon: 'mdi:creation',
        parentId: 2,
        description: 'GPT、Claude、Llama 等大模型使用经验',
        sortOrder: 1,
        postCount: 98,
        themeColor: '#8B5CF6',
      },
      {
        id: 22,
        name: 'AI 工程化',
        icon: 'mdi:cog',
        parentId: 2,
        description: 'MLOps、模型部署、推理优化',
        sortOrder: 2,
        postCount: 67,
        themeColor: '#8B5CF6',
      },
    ],
  },
  {
    id: 3,
    name: '运维 & DevOps',
    icon: 'mdi:cloud-cog',
    parentId: null,
    description: 'Docker、K8s、CI/CD、云原生',
    sortOrder: 3,
    postCount: 175,
    themeColor: '#10B981',
    children: [
      {
        id: 31,
        name: '容器与编排',
        icon: 'mdi:docker',
        parentId: 3,
        description: 'Docker、Kubernetes 相关',
        sortOrder: 1,
        postCount: 89,
        themeColor: '#10B981',
      },
      {
        id: 32,
        name: '云服务',
        icon: 'mdi:cloud',
        parentId: 3,
        description: 'AWS、阿里云、腾讯云等',
        sortOrder: 2,
        postCount: 43,
        themeColor: '#10B981',
      },
    ],
  },
  {
    id: 4,
    name: '求职 & 面试',
    icon: 'mdi:briefcase-search',
    parentId: null,
    description: '面经分享、简历优化、职业规划',
    sortOrder: 4,
    postCount: 128,
    themeColor: '#F59E0B',
    children: [
      {
        id: 41,
        name: '面经分享',
        icon: 'mdi:clipboard-text',
        parentId: 4,
        description: '各大公司面试经验分享',
        sortOrder: 1,
        postCount: 76,
        themeColor: '#F59E0B',
      },
      {
        id: 42,
        name: '职业规划',
        icon: 'mdi:rocket-launch',
        parentId: 4,
        description: '技术成长路径、跳槽建议',
        sortOrder: 2,
        postCount: 52,
        themeColor: '#F59E0B',
      },
    ],
  },
  {
    id: 5,
    name: '开源项目',
    icon: 'mdi:open-source-initiative',
    parentId: null,
    description: '开源项目推荐、Contributing 经验',
    sortOrder: 5,
    postCount: 89,
    themeColor: '#EF4444',
    children: [],
  },
  {
    id: 6,
    name: '灌水区',
    icon: 'mdi:coffee',
    parentId: null,
    description: '闲聊、摸鱼、日常分享',
    sortOrder: 6,
    postCount: 567,
    themeColor: '#6B7280',
    children: [],
  },
];

// === Mock Posts ===

export const mockPosts: PostListItem[] = [
  {
    id: 1,
    title: 'Spring Boot 3.x 微服务架构实战：从零搭建到生产部署',
    summary:
      '本文从实际项目出发，详细讲解了如何使用 Spring Boot 3.x + Spring Cloud 构建微服务架构，涵盖服务注册发现、网关路由、熔断降级、链路追踪等核心模块...',
    tagList: ['Spring Boot', '微服务', 'Java', 'Docker'],
    author: mockUsers[0],
    categoryId: 11,
    categoryName: '后端开发',
    viewCount: 12580,
    likeCount: 368,
    commentCount: 87,
    collectCount: 245,
    isTop: true,
    isEssence: true,
    publishedAt: '2026-05-02T10:30:00Z',
  },
  {
    id: 2,
    title: 'React 19 新特性全解析：Server Components 正式落地',
    summary:
      'React 19 终于带来了稳定的 Server Components 支持。本文将深入分析 RSC 的工作原理、最佳实践，以及在现有项目中渐进式迁移的方案...',
    tagList: ['React', 'TypeScript', '前端', '性能优化'],
    author: mockUsers[1],
    categoryId: 12,
    categoryName: '前端开发',
    viewCount: 8930,
    likeCount: 256,
    commentCount: 63,
    collectCount: 178,
    isTop: true,
    isEssence: false,
    publishedAt: '2026-05-01T14:20:00Z',
  },
  {
    id: 3,
    title: '我用 Claude + Cursor 把开发效率提升了 3 倍，分享我的 AI 编程工作流',
    summary:
      '作为一名全栈开发者，我尝试在日常开发中深度集成 AI 工具。从代码补全到架构设计，从调试到文档生成，AI 已经成为了我不可或缺的编程搭档...',
    tagList: ['AI', '大模型', '前端'],
    author: mockUsers[4],
    categoryId: 21,
    categoryName: '大模型应用',
    viewCount: 25670,
    likeCount: 892,
    commentCount: 234,
    collectCount: 567,
    isTop: false,
    isEssence: true,
    publishedAt: '2026-04-30T09:15:00Z',
  },
  {
    id: 4,
    title: 'Kubernetes 集群从 0 到 1：生产环境踩坑记录',
    summary:
      '记录了在生产环境中搭建 K8s 集群的完整过程，包括 etcd 集群、Control Plane 高可用、网络插件选型、Ingress 配置、监控告警体系搭建...',
    tagList: ['Kubernetes', 'Docker', 'Linux', '性能优化'],
    author: mockUsers[6],
    categoryId: 31,
    categoryName: '容器与编排',
    viewCount: 6780,
    likeCount: 189,
    commentCount: 45,
    collectCount: 134,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-29T16:45:00Z',
  },
  {
    id: 5,
    title: '字节跳动后端面经：三面技术 + 一面HR，已OC',
    summary:
      '分享最近字节跳动后端开发岗位的面试经历，一面基础、二面项目深入、三面系统设计，涵盖 JVM 调优、分布式事务、高并发架构设计等考点...',
    tagList: ['Java', '算法', '微服务'],
    author: mockUsers[2],
    categoryId: 41,
    categoryName: '面经分享',
    viewCount: 34210,
    likeCount: 1256,
    commentCount: 342,
    collectCount: 890,
    isTop: false,
    isEssence: true,
    publishedAt: '2026-04-28T20:00:00Z',
  },
  {
    id: 6,
    title: 'Vue 3.5 + Vite 6 企业级后台管理系统搭建指南',
    summary:
      '从项目初始化到生产部署，一步步教你搭建一个功能完备的后台管理系统。包含权限管理、动态路由、国际化、主题切换、数据大屏等实战内容...',
    tagList: ['Vue.js', 'TypeScript', '前端'],
    author: mockUsers[3],
    categoryId: 12,
    categoryName: '前端开发',
    viewCount: 9450,
    likeCount: 298,
    commentCount: 76,
    collectCount: 210,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-27T11:30:00Z',
  },
  {
    id: 7,
    title: 'PostgreSQL 性能优化实战：慢查询从 5s 降到 50ms',
    summary:
      '最近排查了一个线上慢查询问题，从 EXPLAIN 分析到索引优化、从分区表设计到连接池调优，最终将查询时间从 5 秒优化到了 50 毫秒...',
    tagList: ['PostgreSQL', '性能优化', 'MySQL'],
    author: mockUsers[0],
    categoryId: 11,
    categoryName: '后端开发',
    viewCount: 7890,
    likeCount: 234,
    commentCount: 56,
    collectCount: 167,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-26T15:20:00Z',
  },
  {
    id: 8,
    title: 'Rust 入门一个月，我用它重写了核心服务，性能提升了 10 倍',
    summary:
      '分享我从 Python 转 Rust 的学习经历和实践过程。用 Rust 重写了公司的数据处理核心模块，CPU 占用降低了 80%，内存使用减少了 60%...',
    tagList: ['Rust', '性能优化', 'Go'],
    author: mockUsers[7],
    categoryId: 11,
    categoryName: '后端开发',
    viewCount: 15670,
    likeCount: 567,
    commentCount: 178,
    collectCount: 423,
    isTop: false,
    isEssence: true,
    publishedAt: '2026-04-25T08:45:00Z',
  },
  {
    id: 9,
    title: 'Redis 7.x 集群方案对比与实践：主从、哨兵、Cluster 怎么选？',
    summary:
      '详细对比 Redis 三种高可用方案的优缺点和适用场景，结合实际案例分享集群搭建、数据迁移、故障恢复的踩坑经验...',
    tagList: ['Redis', '微服务', 'Docker'],
    author: mockUsers[1],
    categoryId: 11,
    categoryName: '后端开发',
    viewCount: 5340,
    likeCount: 145,
    commentCount: 38,
    collectCount: 98,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-24T13:10:00Z',
  },
  {
    id: 10,
    title: '推荐几个我常用的神仙开源工具，每一个都值得 Star',
    summary:
      '整理了我日常开发中离不开的 10+ 个开源工具，涵盖终端增强、API 调试、数据库管理、代码质量、性能监控等方面，附带使用心得...',
    tagList: ['Go', 'Linux', 'Docker'],
    author: mockUsers[5],
    categoryId: 5,
    categoryName: '开源项目',
    viewCount: 21340,
    likeCount: 890,
    commentCount: 267,
    collectCount: 756,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-23T18:30:00Z',
  },
  {
    id: 11,
    title: '聊聊大模型 RAG 实践：从向量检索到知识库问答的完整链路',
    summary:
      '基于实际项目经验，分享如何构建一个生产级的 RAG 系统。涵盖文档解析、分块策略、Embedding 选型、向量数据库、混合检索、重排序等关键环节...',
    tagList: ['AI', '大模型', 'PostgreSQL'],
    author: mockUsers[7],
    categoryId: 21,
    categoryName: '大模型应用',
    viewCount: 11230,
    likeCount: 345,
    commentCount: 89,
    collectCount: 267,
    isTop: false,
    isEssence: true,
    publishedAt: '2026-04-22T10:00:00Z',
  },
  {
    id: 12,
    title: '三年前端经验，聊聊我从初级到中级的成长路径',
    summary:
      '从只会写页面到独立负责项目，这三年我经历了什么？分享我的技术成长路线、踩过的坑、以及觉得最重要的几个转折点...',
    tagList: ['前端', 'React', 'TypeScript'],
    author: mockUsers[5],
    categoryId: 42,
    categoryName: '职业规划',
    viewCount: 18920,
    likeCount: 678,
    commentCount: 198,
    collectCount: 456,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-21T21:15:00Z',
  },
  {
    id: 13,
    title: 'Docker Compose 多服务编排实战：一个 YAML 管理整套开发环境',
    summary:
      '使用 Docker Compose 编排 PostgreSQL + Redis + Elasticsearch + RabbitMQ + 应用服务的完整开发环境，附带环境变量管理、健康检查、日志配置...',
    tagList: ['Docker', 'Redis', 'PostgreSQL', 'Kubernetes'],
    author: mockUsers[6],
    categoryId: 31,
    categoryName: '容器与编排',
    viewCount: 4560,
    likeCount: 123,
    commentCount: 29,
    collectCount: 87,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-20T14:30:00Z',
  },
  {
    id: 14,
    title: '阿里云 P7 岗位面经：分布式系统设计题详解',
    summary:
      '详细复盘阿里云 P7 的面试过程，重点讲解分布式 ID 生成、分布式锁、分布式事务、一致性哈希等系统设计题的答题思路和扩展方向...',
    tagList: ['Java', '微服务', '算法', 'Redis'],
    author: mockUsers[3],
    categoryId: 41,
    categoryName: '面经分享',
    viewCount: 27890,
    likeCount: 934,
    commentCount: 256,
    collectCount: 678,
    isTop: false,
    isEssence: true,
    publishedAt: '2026-04-19T17:45:00Z',
  },
  {
    id: 15,
    title: '摸鱼帖：今天调了一天的 Bug，发现是少了个分号 🫠',
    summary:
      '记录一下今天的社死时刻——花了整整一天排查一个诡异的 Bug，最后发现只是配置文件里少了个分号。分享一些排查思路，顺便吐槽一下自己...',
    tagList: [],
    author: mockUsers[5],
    categoryId: 6,
    categoryName: '灌水区',
    viewCount: 8960,
    likeCount: 456,
    commentCount: 189,
    collectCount: 34,
    isTop: false,
    isEssence: false,
    publishedAt: '2026-04-18T22:00:00Z',
  },
];

// === Mock Post Details ===

const mockPostContents: Record<number, { content: string; aiSummary?: string; aiKeywords?: string[] }> = {
  1: {
    content: `## 前言

在当今的互联网架构中，微服务已经成为大型应用的标配。本文将从零开始，带领大家搭建一套完整的 Spring Boot 3.x 微服务架构。

## 技术选型

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 3.2.x | 基础框架 |
| Spring Cloud | 2023.x | 微服务组件 |
| Nacos | 2.3.x | 服务注册发现 & 配置中心 |
| Sentinel | 1.8.x | 熔断降级 |
| SkyWalking | 9.x | 链路追踪 |
| Seata | 1.7.x | 分布式事务 |

## 项目结构

\`\`\`
linksee-cloud/
├── linksee-gateway/          # API 网关
├── linksee-auth/             # 认证服务
├── linksee-user/             # 用户服务
├── linksee-forum/            # 论坛服务
├── linksee-ai/               # AI 服务
├── linksee-message/          # 消息服务
├── linksee-common/           # 公共模块
└── linksee-feign/            # Feign 客户端
\`\`\`

## 服务注册与发现

使用 Nacos 作为注册中心，配置如下：

\`\`\`yaml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: LINKSEE_GROUP
\`\`\`

## 网关路由配置

通过 Spring Cloud Gateway 实现统一的 API 入口，支持动态路由、限流、鉴权：

\`\`\`yaml
spring:
  cloud:
    gateway:
      routes:
        - id: forum-service
          uri: lb://linksee-forum
          predicates:
            - Path=/api/forum/**
          filters:
            - StripPrefix=1
\`\`\`

## 总结

本文涵盖了微服务架构的核心模块搭建。后续会陆续更新每个模块的详细配置和最佳实践。

> 完整代码已开源，欢迎 Star`,
    aiSummary: '完整的 Spring Boot 3.x 微服务架构搭建教程，涵盖 Nacos、Gateway、Sentinel、SkyWalking、Seata 等核心模块。',
    aiKeywords: ['Spring Boot', '微服务', 'Nacos', 'Spring Cloud', '分布式事务'],
  },
  2: {
    content: `## React 19 带来了什么？

React 19 是 React 团队自引入 Hooks 以来最重要的版本更新。其中最受关注的特性就是 **React Server Components (RSC)** 正式变为稳定 API。

### Server Components vs Client Components

\`\`\`tsx
// Server Component (默认) — 在服务端渲染
async function PostList() {
  const posts = await fetchPosts();
  return (
    <ul>
      {posts.map(post => <PostItem key={post.id} post={post} />)}
    </ul>
  );
}

// Client Component — 在客户端运行交互逻辑
'use client';
function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>❤️</button>;
}
\`\`\`

### 核心优势

1. **零 Bundle Size** — Server Component 的代码不会打包到客户端 JS 中
2. **直接后端访问** — 可以直接读取数据库、调用文件系统
3. **自动代码分割** — 只在需要时加载 Client Component

### Actions 简化表单处理

\`\`\`tsx
function CreatePost() {
  async function handleSubmit(formData) {
    'use server';
    await db.posts.create({
      title: formData.get('title'),
      content: formData.get('content'),
    });
  }
  return <form action={handleSubmit}>...</form>;
}
\`\`\`

> RAG 不是银弹，适合 SSR 场景。纯 SPA 项目按需引入即可。`,
    aiSummary: '深入解析 React 19 的 Server Components 和 Actions 特性，对比 Server/Client Component 的使用场景和优势。',
    aiKeywords: ['React 19', 'Server Components', 'RSC', '前端框架'],
  },
  3: {
    content: `## 为什么选择 Claude + Cursor？

试了一圈 AI 编程工具，最终定格在 **Claude (Anthropic)** + **Cursor (IDE)** 的组合。

## 我的工作流

### 1. 项目初始化

用 Claude 生成项目脚手架和技术选型文档。

### 2. 日常开发

- **写新功能**：先让 Claude 生成代码骨架，再在 Cursor 中用 Tab 补全细节
- **Debug**：把错误日志直接贴给 Claude，通常一次就能定位问题
- **Code Review**：提交前让 Claude 审查代码质量和安全隐患

### 3. 效率对比

| 任务 | 之前 (小时) | 现在 (小时) | 提升倍数 |
|------|-----------|-----------|---------|
| 新建 API 接口 | 2 | 0.5 | 4x |
| 排查 Bug | 4 | 1 | 4x |
| 写单元测试 | 3 | 0.5 | 6x |
| 编写文档 | 2 | 0.3 | 6.7x |

## 注意事项

- **不要盲目信任 AI 生成的代码**，务必 review 后再使用
- **提供足够的上下文**，AI 越了解项目，输出质量越高
- **保持编程能力**，AI 是工具不是替代品`,
    aiSummary: '分享 Claude + Cursor 组合提升开发效率的完整工作流，涵盖项目初始化、日常开发和调试的 AI 辅助实践。',
    aiKeywords: ['AI 编程', 'Claude', 'Cursor', '开发效率'],
  },
  4: {
    content: `## 背景

公司要迁移到 K8s，我被安排负责整个集群的搭建和迁移工作。

## 集群规划

### 节点规划

| 角色 | 数量 | 规格 | 说明 |
|------|------|------|------|
| Control Plane | 3 | 4C8G | etcd + API Server |
| Worker | 6 | 8C16G | 运行业务 Pod |
| Ingress | 2 | 4C8G | Nginx Ingress |

### 网络方案选择

最终选择了 **Calico** 作为 CNI 插件：

\`\`\`bash
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.26.0/manifests/calico.yaml
\`\`\`

## 监控告警

使用 Prometheus + Grafana + AlertManager 体系：

\`\`\`yaml
- alert: PodCrashLooping
  expr: rate(kube_pod_container_status_restarts_total[15m]) * 60 * 5 > 0
  for: 15m
  labels:
    severity: critical
\`\`\`

## 总结

搭建 K8s 集群最大的挑战不在技术本身，而在于**运维体系的建立**。`,
    aiKeywords: ['Kubernetes', 'Docker', 'Calico', '集群运维'],
  },
  5: {
    content: `## 背景

楼主坐标北京，3 年 Java 后端经验。最近投了字节跳动的后端开发岗位。

## 一面：基础 + 项目 (45min)

### Java 基础
- HashMap 底层实现（数组 + 链表 + 红黑树）
- ConcurrentHashMap 如何保证线程安全
- JVM 内存模型 & 垃圾回收算法
- 线程池核心参数及拒绝策略

### 项目深挖
- "你提到用 Redis 做缓存，缓存击穿怎么处理的？"
- "分布式事务用的什么方案？Seata 的 AT 模式能讲讲吗？"

## 二面：项目深入 + 设计 (50min)

### 系统设计
- 设计一个秒杀系统，如何防止超卖？
- 设计一个短链服务，如何保证高性能？

## 三面：系统设计 (40min)

设计一个 **微博 Feed 流系统**：

1. **推模式 vs 拉模式**如何选择？
2. 大V（千万粉丝）如何处理？
3. 如何保证 feed 的实时性？

## HR 面 (20min)

常规问题：为什么离职、职业规划、期望薪资。

> **三面后三天收到 OC！** 建议多刷 LeetCode 中等难度题。`,
    aiKeywords: ['字节跳动', '面经', 'Java', '系统设计', 'JVM'],
  },
  6: {
    content: `## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5 | 前端框架 |
| Vite | 6.x | 构建工具 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由 |

## 动态路由实现

\`\`\`ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('@/views/login/index.vue') },
    {
      path: '/',
      component: Layout,
      beforeEnter: guardRoute,
      children: dynamicRoutes,
    },
  ],
});
\`\`\`

## 主题切换

使用 CSS 变量实现主题切换：

\`\`\`ts
function toggleTheme(isDark: boolean) {
  const root = document.documentElement;
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
}
\`\`\`

> 建议使用 Vite 的 \`import.meta.glob\` 实现路由自动注册。`,
    aiKeywords: ['Vue 3', 'Vite', '后台管理系统', 'TypeScript'],
  },
  7: {
    content: `## 问题背景

线上有一个查询接口突然变慢，P99 从 200ms 飙升到 5s。

## 第一步：EXPLAIN 分析

\`\`\`sql
EXPLAIN ANALYZE
SELECT p.*, u.nickname, c.name as category_name
FROM forum_post p
LEFT JOIN sys_user u ON p.author_id = u.id
WHERE p.status = 1
ORDER BY p.sort_weight DESC
LIMIT 20 OFFSET 10000;
\`\`\`

发现问题：全表扫描 + OFFSET 扫描大量无效行。

## 第二步：添加索引

\`\`\`sql
CREATE INDEX idx_post_status_weight_time
ON forum_post (status, sort_weight DESC, published_at DESC);
\`\`\`

## 第三步：游标分页替代 OFFSET

\`\`\`sql
SELECT p.*, u.nickname
FROM forum_post p
JOIN sys_user u ON p.author_id = u.id
WHERE p.status = 1
  AND (p.sort_weight, p.published_at) < ($1, $2)
ORDER BY p.sort_weight DESC
LIMIT 20;
\`\`\`

## 最终效果

| 指标 | 优化前 | 优化后 |
|------|-------|-------|
| P50 | 800ms | 15ms |
| P99 | 5000ms | 50ms |

> **核心经验**：大偏移量分页是 PostgreSQL 常见性能杀手，优先考虑游标分页。`,
    aiKeywords: ['PostgreSQL', '性能优化', '索引', 'SQL 调优'],
  },
  8: {
    content: `## 为什么学 Rust？

公司的数据处理服务用 Python 写的，每天处理约 500GB 的日志数据。随着数据量增长，频繁 OOM。

## 学习路线

### 第 1-2 周：所有权和借用

\`\`\`rust
fn main() {
    let s1 = String::from("hello");
    let s2 = &s1;          // 借用，不转移所有权
    println!("{} {}", s1, s2); // OK

    let s3 = s1;           // 所有权转移
    // println!("{}", s1);  // 编译错误！
}
\`\`\`

### 第 3-4 周：枚举和模式匹配

\`\`\`rust
enum ParseResult {
    Success { data: Vec<u8> },
    Partial { data: Vec<u8>, remaining: usize },
    Error { code: u32, message: String },
}
\`\`\`

## 重写结果

| 指标 | Python 版本 | Rust 版本 |
|------|-----------|----------|
| 处理时间 | 45 min | 4 min |
| CPU 使用率 | 90% | 18% |
| 内存峰值 | 12 GB | 2.1 GB |

> 如果只是写脚本，Python 仍然是最好的选择。但性能敏感的核心模块，Rust 值得投入。`,
    aiKeywords: ['Rust', '性能优化', 'Python', '系统编程'],
  },
  9: {
    content: `## Redis 高可用方案概述

Redis 提供了三种高可用方案，各有适用场景。

### 1. 主从复制 (Master-Slave)

\`\`\`bash
replicaof 192.168.1.100 6379
\`\`\`

**优点**：部署简单，读写分离
**缺点**：主节点挂了需要手动切换

### 2. 哨兵模式 (Sentinel)

\`\`\`bash
sentinel monitor mymaster 192.168.1.100 6379 2
sentinel down-after-milliseconds mymaster 5000
\`\`\`

**优点**：自动故障转移
**缺点**：写入仍然只有一个节点

### 3. Cluster 模式

\`\`\`bash
redis-cli --cluster create \\
  192.168.1.101:7001 192.168.1.102:7002 \\
  192.168.1.103:7003 --cluster-replicas 1
\`\`\`

**优点**：水平扩展、高可用、自动分片
**缺点**：多 Key 操作受限

## 选型建议

| 场景 | 推荐方案 |
|------|---------|
| 数据量 < 10GB | 主从 + 哨兵 |
| 数据量 10-100GB | Cluster |
| 强一致性要求 | 哨兵 + 等待确认写入 |`,
    aiKeywords: ['Redis', '高可用', '集群', '主从复制', '哨兵'],
  },
  10: {
    content: `## 终端增强

### Starship — 跨平台终端提示符

\`\`\`toml
[character]
success_symbol = "[➜](bold green)"
error_symbol = "[✗](bold red)"
\`\`\`

### Zellij — 现代终端复用器

比 tmux 更友好，内置布局系统和快捷键提示。

## 开发工具

### lazygit — 终端 Git 客户端

交互式 Git 操作界面，比命令行效率高很多。

### httpie — 人性化 HTTP 客户端

\`\`\`bash
http GET api.example.com/posts Authorization:"Bearer token"
\`\`\`

## 代码质量

### ruff — Python Linter & Formatter

比 flake8 + black 快 10-100 倍。

### oxlint — JavaScript Linter

Rust 编写，比 ESLint 快 50-100 倍。

## 性能监控

### btop — 系统监控

比 htop 好看 100 倍的系统资源监控器。

> 以上工具全部开源免费，每个都亲自用过至少 3 个月。`,
    aiKeywords: ['开源工具', '终端', '开发效率', 'Git'],
  },
  11: {
    content: `## 什么是 RAG？

RAG (Retrieval-Augmented Generation) 即检索增强生成，通过检索外部知识来增强大模型的回答质量。

## 整体架构

\`\`\`
用户提问 → Embedding 向量化 → 向量数据库检索 → 组装 Prompt → LLM 生成回答
\`\`\`

## 关键环节

### 文本分块

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", "。", ".", " "],
)
chunks = splitter.split_documents(documents)
\`\`\`

### Embedding 选型

| 模型 | 维度 | 中文效果 |
|------|------|---------|
| text-embedding-3-small | 1536 | 良好 |
| bge-large-zh-v1.5 | 1024 | 优秀 |
| m3e-base | 768 | 良好 |

### 混合检索

向量检索 + BM25 的混合方案效果最佳。

> RAG 的核心不在模型，而在**数据预处理和检索质量**。`,
    aiKeywords: ['RAG', '大模型', '向量检索', 'Embedding', '知识库'],
  },
  12: {
    content: `## 我的背景

- **学历**：普通二本，计算机科学与技术
- **入职时**：只会 HTML/CSS/JS 三件套
- **三年后**：独立负责公司前端架构，带 3 人小组

## 第一年：打基础

- 系统学 JS：手写 Promise、手写 Event Emitter
- CSS 进阶：从 Flex 到 Grid，理解 BFC、层叠上下文
- Vue 实战：参与公司内部管理系统开发

> 这个阶段最重要的是**不要焦虑**，基础打牢后面会飞起来。

## 第二年：能力跃迁

公司新项目决定用 React + TS，跳出了 Vue 的舒适区。

- **TypeScript** 改变了我写代码的方式
- **React Hooks** 让我理解了函数式编程
- 开始关注性能优化：虚拟列表、代码分割、缓存策略

## 第三年：独当一面

- 主导前端技术选型和架构设计
- 搭建了组件库 + CLI 工具 + CI/CD 流水线
- 开始写技术博客

## 最重要的建议

1. **基础 > 框架**：JS 基础决定了你的上限
2. **多读源码**：坚持下来收益巨大
3. **写博客**：教是最好的学`,
    aiKeywords: ['前端成长', '职业规划', 'React', 'TypeScript'],
  },
  13: {
    content: `## docker-compose.yml

\`\`\`yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: linksee
      POSTGRES_USER: admin
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  elasticsearch:
    image: elasticsearch:8.16.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"
\`\`\`

## 一键启动

\`\`\`bash
docker compose up -d
docker compose ps
docker compose logs -f postgres
docker compose down -v
\`\`\`

> 敏感信息用 \`.env\` 管理，通过 \`.gitignore\` 排除。`,
    aiKeywords: ['Docker Compose', 'PostgreSQL', 'Redis', '开发环境'],
  },
  14: {
    content: `## 面试概况

- **岗位**：阿里云后端开发 P7
- **形式**：4 轮技术 + 1 轮交叉面 + HR 面
- **结果**：Offer (已接)

### 1. 分布式 ID 生成

\`\`\`
方案对比：
├── UUID — 简单但无序
├── 数据库自增 — 单点瓶颈
├── Snowflake — 推荐 ⭐
│   ├── 1 bit 符号位
│   ├── 41 bit 时间戳
│   ├── 10 bit 机器 ID
│   └── 12 bit 序列号
└── 号段模式 — 美团 Leaf
\`\`\`

### 2. 分布式锁

\`\`\`java
RLock lock = redissonClient.getLock("resource:lock");
try {
    if (lock.tryLock(30, TimeUnit.SECONDS)) {
        // 业务逻辑
    }
} finally {
    lock.unlock();
}
\`\`\`

### 3. 分布式事务

\`\`\`
方案演进：
1. 2PC → 性能差
2. TCC → 需要写 Try/Confirm/Cancel
3. Saga → 长事务场景
4. Seata AT → 推荐 ⭐
\`\`\`

> 先给方案概览，再深入一个细节，最后对比各方案优缺点。`,
    aiKeywords: ['阿里云', 'P7', '分布式系统', '系统设计', '面经'],
  },
  15: {
    content: `## 事情的起因

今天早上运行测试的时候发现一个接口返回 500：

\`\`\`
Error: Cannot read properties of undefined (reading 'config')
    at UserService.getProfile (user.service.ts:42)
\`\`\`

## 排查过程

### 第一步：检查代码

\`\`\`ts
async getProfile(userId: string) {
  const user = await this.userRepo.findOne(userId);
  return user.config.theme; // ← 报错
}
\`\`\`

\`user\` 是 \`undefined\`。为什么找不到？

### 第二步：检查数据库

\`\`\`sql
SELECT * FROM sys_user WHERE id = 'xxx';
-- 返回空结果
\`\`\`

数据明明在的啊...

### 第三步：发现元凶

\`\`\`yaml
# application.yml
database:
  name: linksee_dev;  # ← 多了一个分号！
\`\`\`

**多了一个分号**，导致连接了 \`linksee_dev;\` 这个空数据库。

## 反思

1. **先看配置再看代码**
2. **善用断点调试**：10 分钟就能解决
3. **写好错误信息**：undefined 时给出明确提示

> 全公司都知道了这件事。领导安慰我说"资深工程师也会犯这种错"。我还是想辞职`,
    aiKeywords: ['Debug', '日常', '社死', '配置文件'],
  },
};

export function getMockPostDetail(id: number): PostDetail | undefined {
  const post = mockPosts.find((p) => p.id === id);
  if (!post) return undefined;
  const detail = mockPostContents[id];
  return {
    ...post,
    content: detail?.content ?? `## ${post.title}\n\n${post.summary}\n\n> 详情内容加载中...`,
    coverImageUrl: '',
    aiSummary: detail?.aiSummary,
    aiKeywords: detail?.aiKeywords,
  };
}

// === Helper: format relative time ===

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  const { t } = i18n;

  if (diffMin < 1) return t('time.justNow');
  if (diffMin < 60) return t('time.minutesAgo', { count: diffMin });
  if (diffHour < 24) return t('time.hoursAgo', { count: diffHour });
  if (diffDay < 30) return t('time.daysAgo', { count: diffDay });
  return date.toLocaleDateString(i18n.language === 'zh-CN' ? 'zh-CN' : 'en-US');
}

// === Helper: format number ===

export function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}
