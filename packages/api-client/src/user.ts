import type { ApiResponse, CheckInResponse, PaginatedRequest, PostListItem, UserInfo } from "@linksee/shared";
import apiClient from ".";

export const userApi = {
    getProfile: () =>
        apiClient.get<ApiResponse<UserInfo>>("/user/profile"),

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post<ApiResponse<null>>("/user/avatar", formData);
    },

    checkIn: () =>
        apiClient.get<ApiResponse<CheckInResponse>>("/user/check-in"),

    getFollowers: (params: PaginatedRequest) =>
        apiClient.get<ApiResponse<UserInfo[]>>("/user/followers", { params }),

    getFollowing: (params: PaginatedRequest) =>
        apiClient.get<ApiResponse<UserInfo[]>>("/user/following", { params }),

    getRankings: () =>
        apiClient.get<ApiResponse<UserInfo[]>>("/user/rankings"),

    getUsersProfile: (userId: number) =>
        apiClient.get<ApiResponse<UserInfo>>(`/user/profile/${userId}/profile`),

    getUsersPosts: (userId: number, params: PaginatedRequest) =>
        apiClient.get<ApiResponse<PostListItem[]>>(`/user/${userId}/posts`, { params }),

}