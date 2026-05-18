import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AiChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  isTyping: boolean;
  inputText: string;
  getActiveConversation: () => Conversation | undefined;
  newConversation: () => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (msg: ChatMessage) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;
  setIsTyping: (v: boolean) => void;
  setInputText: (v: string) => void;
}

export const useAiChatStore = create<AiChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      isTyping: false,
      inputText: '',

      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return conversations.find((c) => c.id === activeConversationId);
      },

      newConversation: () => {
        const id = `conv-${Date.now()}`;
        const now = new Date().toISOString();
        const newConv: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          conversations: [newConv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      setActiveConversation: (id) => set({ activeConversationId: id }),

      addMessage: (msg) =>
        set((s) => {
          const activeId = s.activeConversationId;
          if (!activeId) {
            const newId = `conv-${Date.now()}`;
            const now = new Date().toISOString();
            return {
              conversations: [
                {
                  id: newId,
                  title: msg.content.slice(0, 30) || 'New Chat',
                  messages: [msg],
                  createdAt: now,
                  updatedAt: now,
                },
                ...s.conversations,
              ],
              activeConversationId: newId,
            };
          }
          return {
            conversations: s.conversations.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    title: c.messages.length === 0 ? msg.content.slice(0, 30) : c.title,
                    messages: [...c.messages, msg],
                    updatedAt: new Date().toISOString(),
                  }
                : c,
            ),
          };
        }),

      deleteConversation: (id) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
        })),

      clearAll: () => set({ conversations: [], activeConversationId: null }),

      setIsTyping: (v) => set({ isTyping: v }),

      setInputText: (v) => set({ inputText: v }),
    }),
    {
      name: 'linksee-ai-chat',
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    },
  ),
);
