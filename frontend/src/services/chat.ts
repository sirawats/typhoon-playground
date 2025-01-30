// src/services/chat.ts
import type {
  ChatSessionMetricsDTO,
  ChatSessionResponseDTO,
  CreateFeedbackRequestDTO,
  CreateMessageRequestDTO,
  CreateSessionRequestDTO,
  FeedbackResponseDTO,
  UpdateSessionRequestDTO,
} from '@/types/dtos/chat';
import { apiClient, BASE_URL } from '@/utils/api-client';
import { useAuthStore } from '../store/auth';

export const chatService = {
  getSessions: async (
    skip = 0,
    limit = 50
  ): Promise<ChatSessionResponseDTO[]> => {
    return apiClient.get('/chat/sessions', {
      params: { skip: String(skip), limit: String(limit) },
      withAuth: true,
    });
  },

  getSession: async (sessionId: number): Promise<ChatSessionResponseDTO> => {
    return apiClient.get(`/chat/sessions/${sessionId}`, { withAuth: true });
  },

  createSession: async (
    data: CreateSessionRequestDTO
  ): Promise<ChatSessionResponseDTO> => {
    return apiClient.post('/chat/sessions', data, { withAuth: true });
  },

  updateSession: async (
    sessionId: number,
    data: UpdateSessionRequestDTO
  ): Promise<ChatSessionResponseDTO> => {
    return apiClient.patch(`/chat/sessions/${sessionId}`, data, {
      withAuth: true,
    });
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    return apiClient.delete(`/chat/sessions/${sessionId}`, { withAuth: true });
  },

  sendMessage: async (
    sessionId: number,
    data: CreateMessageRequestDTO,
    onChunk: (chunk: string) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    const response = await fetch(
      `${BASE_URL}/chat/sessions/${sessionId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useAuthStore.getState().token && {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          }),
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No readable stream available');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk and parse SSE format
        const text = decoder.decode(value);
        const lines = text.split('\n\n');

        for (const line of lines) {
          if (!line) continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data.content);
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          } else if (line.startsWith('event: error')) {
            const errorData = JSON.parse(line.slice(line.indexOf('{')));
            onError(errorData.error);
            break;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  addFeedback: async (
    messageId: number,
    data: CreateFeedbackRequestDTO
  ): Promise<FeedbackResponseDTO> => {
    return apiClient.post(`/chat/messages/${messageId}/feedback`, data, {
      withAuth: true,
    });
  },

  getSessionMetrics: async (
    sessionId: number
  ): Promise<ChatSessionMetricsDTO> => {
    return apiClient.get(`/chat/sessions/${sessionId}/metrics`, {
      withAuth: true,
    });
  },
};
