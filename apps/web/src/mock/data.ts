import type { PostListItem, PostDetail, Category, UserInfo } from '@nulk/shared';

// === Mock Users ===

export const mockUsers: Pick<UserInfo, 'id' | 'nickname' | 'avatarUrl' | 'level'>[] = [
  { id: 1, nickname: '林小白', avatarUrl: '', level: 5 },
  { id: 2, nickname: '代码猎人', avatarUrl: '', level: 4 },
  { id: 3, nickname: '技术小白兔', avatarUrl: '', level: 2 },
  { id: 4, nickname: '全栈阿杰', avatarUrl: '', level: 3 },
  { id: 5, nickname: 'DevCat', avatarUrl: '', level: 6 },
  { id: 6, nickname: '前端菜鸡', avatarUrl: '', level: 1 },
  { id: 7, nickname: '云端漫步', avatarUrl: '', level: 4 },
  { id: 8, nickname: 'AI探索者', avatarUrl: '', level: 3 },
];

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

// === Mock Post Detail (for post #1) ===

export const mockPostDetail: PostDetail = {
  ...mockPosts[0],
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

## 总结

本文涵盖了微服务架构的核心模块搭建。后续会陆续更新每个模块的详细配置和最佳实践。

> 完整代码已开源，欢迎 Star ⭐`,
  coverImageUrl: '',
  aiSummary:
    '本文是一篇完整的 Spring Boot 3.x 微服务架构搭建教程，涵盖了 Nacos 服务注册发现、API 网关路由、Sentinel 熔断降级、SkyWalking 链路追踪、Seata 分布式事务等核心模块的配置与实践。',
  aiKeywords: ['Spring Boot', '微服务', 'Nacos', 'Spring Cloud', '分布式事务'],
};

// === Helper: format relative time ===

export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;
  return date.toLocaleDateString('zh-CN');
}

// === Helper: format number ===

export function formatCount(count: number): string {
  if (count >= 10000) return `${(count / 10000).toFixed(1)}w`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}
