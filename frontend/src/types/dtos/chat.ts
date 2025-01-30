// src/types/dtos/chat.ts

// Request DTOs
export interface CreateSessionRequestDTO {
  title?: string;
}

export interface UpdateSessionRequestDTO {
  title: string;
}

export interface CreateMessageRequestDTO {
  model: string;
  outputLength: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
  content: string;
}

export interface CreateFeedbackRequestDTO {
  feedbackType: 'upvote' | 'downvote';
}

// Response DTOs
export interface FeedbackResponseDTO {
  id: number;
  messageId: number;
  feedbackType: 'upvote' | 'downvote';
  createdAt: string;
}

export interface ChatMessageResponseDTO {
  id: number;
  sessionId: number;
  content: string;
  sender: 'user' | 'assistant';
  tokens?: number;
  tokensPerSecond?: number;
  responseTimeMs?: number;
  createdAt: string;
  feedback?: FeedbackResponseDTO;
}

export interface ChatSessionResponseDTO {
  id: number;
  userId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessageResponseDTO[];
}

export interface ChatSessionMetricsDTO {
  totalMessages: number;
  totalTokens: number;
  avgTokensPerSecond: number;
  avgResponseTimeMs: number;
}
