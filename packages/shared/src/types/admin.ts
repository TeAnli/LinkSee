export interface DashboardOverview {
  totalUsers: number;
  newUsersToday: number;
  totalPosts: number;
  newPostsToday: number;
  totalComments: number;
  newCommentsToday: number;
  activeUsers7d: number;
  aiCallsToday: number;
}

export interface TrendItem {
  date: string;
  count: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  trendPosts: TrendItem[];
  trendUsers: TrendItem[];
  hotPosts: AdminPostItem[];
  recentModerations: AdminModerationItem[];
}

export interface AdminUserItem {
  id: number;
  username: string;
  nickname: string;
  email: string;
  level: number;
  experience: number;
  status: number;
  createdAt: string | null;
}

export interface AdminPostItem {
  id: number;
  title: string;
  authorId: number;
  authorNickname: string;
  status: number;
  isTop: boolean;
  isEssence: boolean;
  viewCount: number;
  publishedAt: string | null;
}

export interface AdminModerationItem {
  id: number;
  postId: number;
  postTitle: string;
  action: string;
  reason: string;
  operatorName: string;
  createdAt: string;
}

export interface AdminCategoryItem {
  id: number;
  name: string;
  icon: string;
  parentId: number | null;
  description: string;
  sortOrder: number;
  themeColor: string;
  postTemplate: Record<string, unknown> | null;
  aiPersona: string;
  status: number;
}

export interface AiUsageStats {
  totalCalls: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  costEstimate: number;
  avgResponseTimeMs: number;
  breakdown: AiUsageBreakdownItem[];
}

export interface AiUsageBreakdownItem {
  groupBy: string;
  calls: number;
  avgTokens: number;
}

export interface AiTaskLogItem {
  id: number;
  userId: number;
  taskType: string;
  inputSummary: string;
  modelUsed: string;
  tokensInput: number;
  tokensOutput: number;
  responseMs: number;
  status: number;
  createdAt: string | null;
}

export interface UserStatusRequest {
  status: number;
  reason?: string;
  muteUntil?: string;
}

export interface RoleUpdateRequest {
  roles: string[];
  moderatorCategories?: number[];
}

export interface PostModerateRequest {
  action: string;
  reason?: string;
}

export interface PostFeatureRequest {
  isTop?: boolean;
  topExpireAt?: string;
  isEssence?: boolean;
  essenceReason?: string;
}

export interface CategoryManageRequest {
  name: string;
  icon?: string;
  parentId?: number | null;
  description?: string;
  sortOrder?: number;
  themeColor?: string;
  postTemplate?: Record<string, unknown> | null;
  aiPersona?: string;
  status?: number;
}

export interface AdminUserListParams {
  keyword?: string;
  status?: number;
  level?: number;
  page?: number;
  size?: number;
}

export interface AdminPostListParams {
  status?: number;
  categoryId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface AdminCategoryListParams {
  page?: number;
  size?: number;
}

export interface AiTaskLogParams {
  userId?: number;
  taskType?: string;
  status?: number;
  page?: number;
  size?: number;
}
