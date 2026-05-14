import { create } from 'zustand';

interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isPanelOpen: boolean;
  addNotification: (n: Notification) => void;
  markAllRead: () => void;
  markAsRead: (id: number) => void;
  removeNotification: (id: number) => void;
  clearAll: () => void;
  togglePanel: () => void;
  setPanelOpen: (v: boolean) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isPanelOpen: false,

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: n.isRead ? s.unreadCount : s.unreadCount + 1,
    })),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  markAsRead: (id) =>
    set((s) => {
      const notif = s.notifications.find((n) => n.id === id);
      return {
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        unreadCount: notif?.isRead === false ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
      };
    }),

  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () =>
    set({ notifications: [], unreadCount: 0 }),

  togglePanel: () =>
    set((s) => ({ isPanelOpen: !s.isPanelOpen })),

  setPanelOpen: (v) =>
    set({ isPanelOpen: v }),
}));
