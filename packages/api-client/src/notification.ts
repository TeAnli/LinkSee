import type {
  ApiResponse,
  Notification,
  UnreadCount,
} from "@linksee/shared";

import apiClient from ".";

export const notificationApi = {
  list: () =>
    apiClient.get<ApiResponse<Notification[]>>("/message/notifications"),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<UnreadCount>>("/message/unread-count"),

  markRead: (id: number) =>
    apiClient.put<ApiResponse<null>>(`/message/${id}/read`),

  markAllRead: () =>
    apiClient.put<ApiResponse<null>>("/message/read-all"),
};
