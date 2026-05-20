import { create } from 'zustand';

export interface ChannelMessage {
  id: string;
  channelId: number;
  senderSessionId: string;
  content: string;
  timestamp: string;
}

export interface DmMessage {
  id: string;
  senderSessionId: string;
  partnerUserId: number;
  content: string;
  timestamp: string;
}

interface ChatState {
  // Channel messages: channelId → messages
  channelMessages: Map<number, ChannelMessage[]>;
  // DM messages: partnerUserId → messages
  dmMessages: Map<number, DmMessage[]>;
  // Online friend IDs
  onlineFriendIds: Set<number>;
  // Connection state: track per-channel participant counts
  channelOnlineCounts: Map<number, number>;

  addChannelMessage: (msg: ChannelMessage) => void;
  addDmMessage: (msg: DmMessage) => void;
  setOnlineFriends: (ids: number[]) => void;
  addOnlineFriend: (userId: number) => void;
  removeOnlineFriend: (userId: number) => void;
  setChannelOnlineCount: (channelId: number, count: number) => void;
  clearChannelMessages: (channelId: number) => void;
  clearAll: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  channelMessages: new Map(),
  dmMessages: new Map(),
  onlineFriendIds: new Set(),
  channelOnlineCounts: new Map(),

  addChannelMessage: (msg) =>
    set((s) => {
      const next = new Map(s.channelMessages);
      const list = next.get(msg.channelId) ?? [];
      next.set(msg.channelId, [...list, msg]);
      return { channelMessages: next };
    }),

  addDmMessage: (msg) =>
    set((s) => {
      const next = new Map(s.dmMessages);
      const list = next.get(msg.partnerUserId) ?? [];
      next.set(msg.partnerUserId, [...list, msg]);
      return { dmMessages: next };
    }),

  setOnlineFriends: (ids) =>
    set({ onlineFriendIds: new Set(ids) }),

  addOnlineFriend: (userId) =>
    set((s) => {
      const next = new Set(s.onlineFriendIds);
      next.add(userId);
      return { onlineFriendIds: next };
    }),

  removeOnlineFriend: (userId) =>
    set((s) => {
      const next = new Set(s.onlineFriendIds);
      next.delete(userId);
      return { onlineFriendIds: next };
    }),

  setChannelOnlineCount: (channelId, count) =>
    set((s) => {
      const next = new Map(s.channelOnlineCounts);
      next.set(channelId, count);
      return { channelOnlineCounts: next };
    }),

  clearChannelMessages: (channelId) =>
    set((s) => {
      const next = new Map(s.channelMessages);
      next.delete(channelId);
      return { channelMessages: next };
    }),

  clearAll: () =>
    set({
      channelMessages: new Map(),
      dmMessages: new Map(),
      onlineFriendIds: new Set(),
      channelOnlineCounts: new Map(),
    }),
}));
