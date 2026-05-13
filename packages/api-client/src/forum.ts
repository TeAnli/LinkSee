import type {
  ApiResponse,
  PaginatedResponse,
  PostListItem,
  PostDetailResponse,
  PostCreateRequest,
  PostCreateResponse,
  PostListParams,
  Category,
  CommentItem,
  CommentListParams,
  CommentCreateRequest,
  ToggleResponse,
} from "@linksee/shared";

import apiClient from ".";

export const forumApi = {
  listCategories: () =>
    apiClient.get<ApiResponse<Category[]>>("/forum/categories"),

  getCategoryDetail: (categoryId: number) =>
    apiClient.get<ApiResponse<Category>>(`/forum/categories/${categoryId}`),

  listPosts: (params?: PostListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<PostListItem>>>(
      "/forum/posts",
      { params },
    ),

  getPostDetail: (postId: number) =>
    apiClient.get<ApiResponse<PostDetailResponse>>(`/forum/post/${postId}`),

  createPost: (data: PostCreateRequest) =>
    apiClient.post<ApiResponse<PostCreateResponse>>("/forum/post", data),

  getComments: (postId: number, params?: CommentListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<CommentItem>>>(
      `/forum/post/${postId}/comments`,
      { params },
    ),

  createComment: (postId: number, data: CommentCreateRequest) =>
    apiClient.post<ApiResponse<CommentItem>>(
      `/forum/post/${postId}/comments`,
      data,
    ),

  toggleLike: (postId: number) =>
    apiClient.post<ApiResponse<ToggleResponse>>(`/forum/post/${postId}/like`),

  toggleCollect: (postId: number) =>
    apiClient.post<ApiResponse<ToggleResponse>>(
      `/forum/post/${postId}/collect`,
    ),
};
