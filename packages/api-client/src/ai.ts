import type { ApiResponse } from "@linksee/shared";
import apiClient from ".";

export interface ChatSendRequest {
  question: string;
  sessionId?: string;
  stream?: boolean;
}

export interface ChatSendResponse {
  sessionId: string;
  answer: string;
  sources?: { postId: number; title: string; authorName: string; relevance: number }[];
  followups?: string[];
  tokensUsed?: { input: number; output: number };
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { postId: number; title: string; authorName: string }[];
  createdAt: string;
}

export interface QuotaInfo {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  level: number;
}

export const aiApi = {
  chatSend: (data: ChatSendRequest) =>
    apiClient.post<ApiResponse<ChatSendResponse>>("/ai/chat/send", data),

  getSessions: (page = 1, size = 20) =>
    apiClient.get<ApiResponse<{ total: number; sessions: ChatSession[] }>>(
      "/ai/chat/sessions",
      { params: { page, size } },
    ),

  getSessionMessages: (sessionId: string) =>
    apiClient.get<ApiResponse<{ messages: ChatMessage[] }>>(
      `/ai/chat/session/${sessionId}/messages`,
    ),

  deleteSession: (sessionId: string) =>
    apiClient.delete<ApiResponse<null>>(`/ai/chat/session/${sessionId}`),

  getQuota: () =>
    apiClient.get<ApiResponse<QuotaInfo>>("/ai/usage/quota"),
};
