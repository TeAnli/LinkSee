import apiClient from ".";
import type {
  DashboardData,
  AdminUserItem,
  AdminPostItem,
  AdminCategoryItem,
  AiUsageStats,
  AiTaskLogItem,
  UserStatusRequest,
  RoleUpdateRequest,
  PostModerateRequest,
  PostFeatureRequest,
  CategoryManageRequest,
  AdminUserListParams,
  AdminPostListParams,
  AdminCategoryListParams,
  AiTaskLogParams,
} from "@linksee/shared";
import type { ApiResponse, PaginatedResponse } from "@linksee/shared";

export const adminApi = {
  dashboard: () =>
    apiClient.get<ApiResponse<DashboardData>>("/admin/dashboard"),

  listUsers: (params?: AdminUserListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<AdminUserItem>>>(
      "/admin/users",
      { params },
    ),

  updateUserStatus: (userId: number, req: UserStatusRequest) =>
    apiClient.put<ApiResponse<null>>(`/admin/users/${userId}/status`, req),

  updateUserRoles: (userId: number, req: RoleUpdateRequest) =>
    apiClient.put<ApiResponse<null>>(`/admin/users/${userId}/roles`, req),

  listPosts: (params?: AdminPostListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<AdminPostItem>>>(
      "/admin/posts",
      { params },
    ),

  moderatePost: (postId: number, req: PostModerateRequest) =>
    apiClient.post<ApiResponse<null>>(`/admin/posts/${postId}/moderate`, req),

  setPostFeature: (postId: number, req: PostFeatureRequest) =>
    apiClient.put<ApiResponse<null>>(`/admin/posts/${postId}/feature`, req),

  createCategory: (req: CategoryManageRequest) =>
    apiClient.post<ApiResponse<null>>("/admin/categories", req),

  listCategories: (params?: AdminCategoryListParams) =>
    apiClient.get<ApiResponse<PaginatedResponse<AdminCategoryItem>>>(
      "/admin/categories",
      { params },
    ),

  updateCategory: (categoryId: number, req: CategoryManageRequest) =>
    apiClient.put<ApiResponse<null>>(`/admin/categories/${categoryId}`, req),

  deleteCategory: (categoryId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/categories/${categoryId}`),

  aiUsageStats: () =>
    apiClient.get<ApiResponse<AiUsageStats>>("/admin/ai/usage/stats"),

  aiTaskLogs: (params?: AiTaskLogParams) =>
    apiClient.get<ApiResponse<{ total: number; tasks: AiTaskLogItem[] }>>(
      "/admin/ai/tasks",
      { params },
    ),
};
