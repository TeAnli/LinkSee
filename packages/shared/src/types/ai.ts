// === AI Types ===

export interface AiTitleGenerateRequest {
  content: string;
  categoryId: number;
  style?: "technical" | "question" | "story" | "data" | "suspense";
}

export interface AiTitleGenerateResponse {
  taskId: string;
  titles: string[];
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: AiSource[];
  createdAt: string;
}

export interface AiSource {
  postId: number;
  title: string;
  authorName: string;
  snippet: string;
}

export interface AiChatSession {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}
