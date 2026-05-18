// === WebSocket Protocol Types ===
// Matches ws-server message protocol (Spring WebFlux Reactive WebSocket)

/** 客户端 → 服务端 消息类型 */
export enum InboundType {
  AUTH = 'AUTH',
  JOIN_CHANNEL = 'JOIN_CHANNEL',
  LEAVE_CHANNEL = 'LEAVE_CHANNEL',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  DM_MESSAGE = 'DM_MESSAGE',
  PING = 'PING',
}

/** 服务端 → 客户端 消息类型 */
export enum OutboundType {
  PONG = 'PONG',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  DM_MESSAGE = 'DM_MESSAGE',
  USER_JOINED = 'USER_JOINED',
  USER_LEFT = 'USER_LEFT',
  FRIEND_ONLINE = 'FRIEND_ONLINE',
  FRIEND_OFFLINE = 'FRIEND_OFFLINE',
  ONLINE_FRIENDS = 'ONLINE_FRIENDS',
  ERROR = 'ERROR',
}

// ---- Payload Types ----

export interface AuthPayload {
  userId: number;
  friendIds?: number[];
}

export interface ChannelPayload {
  channelId: number;
}

export interface ChatMessagePayload {
  channelId: number;
  content: string;
}

export interface DmMessagePayload {
  targetUserId: number;
  content: string;
}

export interface ChatMessageOutPayload {
  channelId: number;
  senderSessionId: string;
  content: string;
  timestamp: string;
}

export interface DmMessageOutPayload {
  senderSessionId: string;
  content: string;
  timestamp: string;
}

export interface UserJoinedPayload {
  sessionId: string;
  channelId: number;
  onlineCount: number;
}

export interface UserLeftPayload {
  sessionId: string;
  channelId: number;
  onlineCount: number;
}

export interface FriendOnlinePayload {
  userId: number;
  timestamp: string;
}

export interface FriendOfflinePayload {
  userId: number;
  timestamp: string;
}

export interface OnlineFriendsPayload {
  onlineFriendIds: number[];
}

// ---- Generic Message Wrappers ----

export interface WsInboundMessage {
  type: string;
  payload?: Record<string, unknown> | null;
}

export interface WsOutboundMessage {
  type: string;
  payload?: unknown;
}
