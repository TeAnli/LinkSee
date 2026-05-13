import type { UserInfo } from "./auth";

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

// === Forum Request Types ===

export interface PostCreateRequest {
  categoryId: number;
  title: string;
  content: string;
  tagList?: string[];
  coverImageUrl?: string;
}

export interface PostUpdateRequest {
  title?: string;
  content?: string;
  tagList?: string[];
  categoryId?: number;
  coverImageUrl?: string;
}

export interface CommentCreateRequest {
  content: string;
  parentId?: number;
  replyUserId?: number;
}

export interface PostListParams {
  categoryId?: number;
  sort?: "hot" | "latest" | "featured";
  tag?: string;
  keyword?: string;
  authorId?: number;
  page?: number;
  size?: number;
}

export interface CommentListParams {
  sortBy?: "latest" | "oldest" | "popular";
  page?: number;
  size?: number;
  rootOnly?: boolean;
}

export interface FavoritesParams {
  sortBy?: "latest" | "oldest";
  page?: number;
  size?: number;
}

// === Forum Response Types ===

export interface AuthorBrief {
  id: number;
  nickname: string;
  avatarUrl: string;
  level: number;
  bio: string;
  postCount: number;
  followerCount: number;
  isFollowed: boolean;
}

export interface PostDetailData {
  id: number;
  title: string;
  content: string;
  summary: string;
  coverImageUrl: string;
  tagList: string[];
  categoryId: number;
  categoryName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  collectCount: number;
  status: number;
  isTop: boolean;
  isEssence: boolean;
  authorId: number;
  authorNickname: string;
  authorAvatarUrl: string;
  authorLevel: number;
  publishedAt: string | null;
  createdAt: string | null;
}

export interface AiDataBrief {
  aiSummary: string;
  aiKeywords: string[];
  qualityScore: number;
  estimatedReadTime: number;
}

export interface PostDetailResponse {
  post: PostDetailData;
  author: AuthorBrief | null;
  aiData: AiDataBrief | null;
  isLiked: boolean;
  isCollected: boolean;
}

export interface ReplyTo {
  userId: number;
  nickname: string;
}

export interface CommentItem {
  id: number;
  content: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string | null;
  author: AuthorBrief | null;
  replyTo: ReplyTo | null;
  childCount: number;
  children: CommentItem[];
}

export interface CategoryInfo {
  id: number;
  name: string;
  icon: string;
  description: string;
  themeColor: string;
  postCount: number;
  postTemplate: Record<string, unknown>;
  aiPersona: string;
}

export interface CategoryDetailResponse {
  categoryInfo: CategoryInfo;
  topPosts: PostBrief[];
  essencePosts: PostBrief[];
}

export interface PostBrief {
  id: number;
  title: string;
  author: AuthorBrief | null;
  viewCount: number;
  commentCount: number;
  publishedAt: string | null;
}

export interface ToggleResponse {
  liked?: boolean;
  collected?: boolean;
  followed?: boolean;
  likeCount?: number;
  collectCount?: number;
  followerCount?: number;
}
