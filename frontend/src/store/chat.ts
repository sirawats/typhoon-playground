import { create } from 'zustand';
import type { ChatMessage } from '@/types/chat';

interface ChatState {
  activeSessionId: number | null;
  messages: ChatMessage[];
  streaming: boolean;
  setActiveSession: (sessionId: number | null) => void;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  updateFeedback: (messageId: string, feedback: 'up' | 'down') => void;
  setStreaming: (streaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeSessionId: null,
  messages: [],
  streaming: false,

  setActiveSession: (sessionId) =>
    set({
      activeSessionId: sessionId,
      messages: [], // Clear messages when switching sessions
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  updateFeedback: (messageId, feedback) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      ),
    })),

  setStreaming: (streaming) => set({ streaming }),

  clearMessages: () => set({ messages: [] }),
}));
