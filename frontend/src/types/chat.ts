export interface ChatMessage {
  id: string; // UUID
  content: string;
  role: 'user' | 'assistant';
  feedback?: 'up' | 'down';
  metrics?: {
    tokens: number;
    speed: string;
  };
  createdAt: string; // ISO date string
}

export interface ChatSession {
  id: number;
  userId: number;
  title: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  messages: ChatMessage[];
}

export interface ChatSessionMetrics {
  totalMessages: number;
  totalTokens: number;
  avgTokensPerSecond: number;
  avgResponseTimeMs: number;
}
