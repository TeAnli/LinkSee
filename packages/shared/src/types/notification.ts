// === Notification Types ===

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

// === Check-in Types ===

export interface CheckInResponse {
  pointsEarned: number;
  consecutiveDays: number;
  totalPoints: number;
}
