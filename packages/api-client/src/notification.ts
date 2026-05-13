import type {
  ApiResponse,
  Notification,
  UnreadCount,
} from "@linksee/shared";

import apiClient from ".";

export const notificationApi = {
  list: () =>
    apiClient.get<ApiResponse<Notification[]>>("/notifications"),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<UnreadCount>>("/notifications/unread-count"),

  markRead: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.put<ApiResponse<null>>("/notifications/read-all"),
};
