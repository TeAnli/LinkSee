// === API Response Types ===

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}
export interface PaginatedRequest {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  total: number;
  list: T[];
  hasMore: boolean;
}

// === Auth Types ===

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  emailCode?: string;
  captchaId: string;
  captchaValue: string;
}

export interface SendEmailCodeRequest {
  email: string;
  type?: string; // "register" or "reset-password"
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatarUrl: string;
  email: string;
  level: number;
  experience: number;
  status: number;
  createdAt?: string;
}

// === Forum Types ===

export interface Category {
  id: number;
  name: string;
  icon: string;
  parentId: number | null;
  description: string;
  sortOrder: number;
  postCount: number;
  themeColor: string;
  children?: Category[];
}

export interface PostListItem {
  id: number;
  title: string;
  summary: string;
  tagList: string[];
  author: Pick<UserInfo, "id" | "nickname" | "avatarUrl" | "level">;
  categoryId: number;
  categoryName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  isTop: boolean;
  isEssence: boolean;
  publishedAt: string;
}

export interface PostDetail extends PostListItem {
  content: string;
  coverImageUrl: string;
  aiSummary?: string;
  aiKeywords?: string[];
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  user: Pick<UserInfo, "id" | "nickname" | "avatarUrl" | "level">;
  parentId: number | null;
  likeCount: number;
  createdAt: string;
  replies?: Comment[];
}

// === User Types ===

export interface UserProfileDetail {
  bio: string;
  location: string;
  personalWebsite: string;
  socialLinks: Record<string, string>;
  skillsTags: string[];
  education: string;
  occupation: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
}

export interface UserLevelInfo {
  currentLv: number;
  currentLvName: string;
  currentLvExp: number;
  nextLvExp: number;
  progress: number;
  nextLvName: string;
  todayAiCallsRemaining: number;
  todayAiCallsTotal: number;
}

export interface UserProfileResponse {
  user: UserInfo;
  profile: UserProfileDetail;
  levelInfo: UserLevelInfo;
}

// === AI Types ===

export interface AiTitleGenerateRequest {
  content: string;
  categoryId: number;
  style?: "technical" | "question" | "story" | "data" | "suspense";
}

export interface AiTitleGenerateResponse {
  taskId: string;
  titles: string[];
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: AiSource[];
  createdAt: string;
}

export interface AiSource {
  postId: number;
  title: string;
  authorName: string;
  snippet: string;
}

export interface AiChatSession {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

// === Check-in Types ===

export interface CheckInResponse {
  pointsEarned: number;
  consecutiveDays: number;
  totalPoints: number;
}

// === Message Types ===

export interface Notification {
  id: number;
  type: "interaction" | "system" | "ai";
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCount {
  total: number;
  interaction: number;
  system: number;
  ai: number;
}

// === Enums ===

export enum PostStatus {
  DRAFT = 0,
  PUBLISHED = 1,
  UNDER_REVIEW = 2,
  VIOLATION = 3,
}

export enum UserLevel {
  NEWBIE = 1,
  ACTIVE = 2,
  EXPERT = 3,
  PROFESSIONAL = 4,
  STAR = 5,
  LEADER = 6,
}

export enum UserRole {
  VISITOR = "visitor",
  USER = "user",
  VERIFIED = "verified",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}
