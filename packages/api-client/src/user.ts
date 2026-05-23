import type { ApiResponse, CheckInResponse, PaginatedRequest, PaginatedResponse, PostListItem, UserInfo } from "@linksee/shared";
import apiClient from ".";

export const userApi = {
    getProfile: () =>
        apiClient.get<ApiResponse<UserInfo>>("/user/profile"),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<ApiResponse<null>>("/user/avatar", formData);
    },

    updateProfile: (data: Record<string, unknown>) =>
        apiClient.put<ApiResponse<null>>("/user/profile", data),

    checkIn: () =>
        apiClient.get<ApiResponse<CheckInResponse>>("/user/check-in"),

    getFollowers: (params: PaginatedRequest) =>
        apiClient.get<ApiResponse<PaginatedResponse<UserInfo>>>("/user/followers", { params }),

    getFollowing: (params: PaginatedRequest) =>
        apiClient.get<ApiResponse<PaginatedResponse<UserInfo>>>("/user/followings", { params }),

    getRankings: () =>
        apiClient.get<ApiResponse<UserInfo[]>>("/user/rankings"),

    getUsersProfile: (userId: number) =>
        apiClient.get<ApiResponse<UserInfo>>(`/user/${userId}/profile`),

    getUsersPosts: (userId: number, params: PaginatedRequest) =>
        apiClient.get<ApiResponse<PostListItem[]>>(`/user/${userId}/posts`, { params }),

}