import type {
  WsInboundMessage,
  WsOutboundMessage,
  AuthPayload,
  ChannelPayload,
  ChatMessagePayload,
  DmMessagePayload,
  ChatMessageOutPayload,
  DmMessageOutPayload,
  UserJoinedPayload,
  UserLeftPayload,
  FriendOnlinePayload,
  FriendOfflinePayload,
  OnlineFriendsPayload,
} from '@linksee/shared';

type MessageHandler<T = unknown> = (payload: T) => void;

const HEARTBEAT_INTERVAL = 25_000;
const RECONNECT_BASE_DELAY = 1_000;
const RECONNECT_MAX_DELAY = 30_000;
const RECONNECT_MAX_ATTEMPTS = 10;

interface WsClientOptions {
  url: string;
  token?: string;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

export class WsClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token?: string;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  private handlers = new Map<string, Set<MessageHandler>>();

  private onClose?: (event: CloseEvent) => void;
  private onError?: (event: Event) => void;

  // Public state
  connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  sessionId: string | null = null;

  constructor(options: WsClientOptions) {
    this.url = options.url;
    this.token = options.token;
    this.onClose = options.onClose;
    this.onError = options.onError;
  }

  // === Lifecycle ===

  connect(): void {
    if (this.destroyed || this.ws?.readyState === WebSocket.OPEN) return;

    this.connectionState = 'connecting';
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const msg: WsOutboundMessage = JSON.parse(event.data);
        this.dispatch(msg.type, msg.payload);
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = (event) => {
      this.connectionState = 'disconnected';
      this.stopHeartbeat();
      this.onClose?.(event);
      this.scheduleReconnect();
    };

    ws.onerror = (event) => {
      this.onError?.(event);
    };
  }

  disconnect(): void {
    this.destroyed = true;
    this.stopHeartbeat();
    this.clearReconnect();
    this.ws?.close(1000, 'Client disconnect');
    this.ws = null;
    this.connectionState = 'disconnected';
    this.handlers.clear();
  }

  updateToken(token: string): void {
    this.token = token;
  }

  // === Message Sending ===

  send(type: string, payload?: Record<string, unknown>): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg: WsInboundMessage = { type, payload: payload ?? null };
    this.ws.send(JSON.stringify(msg));
  }

  sendAuth(payload: AuthPayload): void {
    this.send('AUTH', payload as unknown as Record<string, unknown>);
  }

  sendPing(): void {
    this.send('PING');
  }

  sendJoinChannel(payload: ChannelPayload): void {
    this.send('JOIN_CHANNEL', payload as unknown as Record<string, unknown>);
  }

  sendLeaveChannel(payload: ChannelPayload): void {
    this.send('LEAVE_CHANNEL', payload as unknown as Record<string, unknown>);
  }

  sendChatMessage(payload: ChatMessagePayload): void {
    this.send('CHAT_MESSAGE', payload as unknown as Record<string, unknown>);
  }

  sendDmMessage(payload: DmMessagePayload): void {
    this.send('DM_MESSAGE', payload as unknown as Record<string, unknown>);
  }

  // === Message Subscription ===

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  onPong(handler: MessageHandler<string>): () => void {
    return this.on('PONG', handler as MessageHandler);
  }

  onChatMessage(handler: MessageHandler<ChatMessageOutPayload>): () => void {
    return this.on('CHAT_MESSAGE', handler as MessageHandler);
  }

  onDmMessage(handler: MessageHandler<DmMessageOutPayload>): () => void {
    return this.on('DM_MESSAGE', handler as MessageHandler);
  }

  onUserJoined(handler: MessageHandler<UserJoinedPayload>): () => void {
    return this.on('USER_JOINED', handler as MessageHandler);
  }

  onUserLeft(handler: MessageHandler<UserLeftPayload>): () => void {
    return this.on('USER_LEFT', handler as MessageHandler);
  }

  onFriendOnline(handler: MessageHandler<FriendOnlinePayload>): () => void {
    return this.on('FRIEND_ONLINE', handler as MessageHandler);
  }

  onFriendOffline(handler: MessageHandler<FriendOfflinePayload>): () => void {
    return this.on('FRIEND_OFFLINE', handler as MessageHandler);
  }

  onOnlineFriends(handler: MessageHandler<OnlineFriendsPayload>): () => void {
    return this.on('ONLINE_FRIENDS', handler as MessageHandler);
  }

  onError(handler: MessageHandler<string>): () => void {
    return this.on('ERROR', handler as MessageHandler);
  }

  // === Private ===

  private dispatch(type: string, payload: unknown): void {
    const set = this.handlers.get(type);
    if (!set) return;
    for (const handler of set) {
      handler(payload);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.sendPing();
    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer !== null) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.reconnectAttempts >= RECONNECT_MAX_ATTEMPTS) return;

    const delay = Math.min(
      RECONNECT_BASE_DELAY * 2 ** this.reconnectAttempts,
      RECONNECT_MAX_DELAY,
    );

    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnect(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
