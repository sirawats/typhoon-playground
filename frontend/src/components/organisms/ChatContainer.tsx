// src/components/organisms/ChatContainer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { UserMessage } from '../molecules/UserMessage';
import { ChatResponse } from '../molecules/ChatResponse';
import { ChatInput } from '../molecules/ChatInput';
import { FaArrowRotateLeft } from 'react-icons/fa6';
import { Button } from '../atoms/Button';
import { useChatStore } from '@/store/chat';
import { useSession } from '@/hooks/useChat';
import { chatService } from '@/services/chat';
import { useParameters } from '../../store/parameters';
import { Toaster } from 'react-hot-toast';

export function ChatContainer() {
  const activeSessionId = useChatStore((state) => state.activeSessionId);
  const streaming = useChatStore((state) => state.streaming);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const [currentMessage, setCurrentMessage] = useState('');

  const { data: session, updateSession, refetch } = useSession(activeSessionId ?? 0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { model, outputLength, temperature, topP, topK, repetitionPenalty } =
    useParameters();
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId || !content.trim()) return;

    try {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // If first message, change session name and update UI immediately
      if (session?.messages.length === 0) {
        updateSession({ id: activeSessionId, data: { title: content } });
      }

      // Add user message immediately
      const userMessage = {
        id: Date.now(),
        content,
        sender: 'user' as const,
        sessionId: activeSessionId,
        createdAt: new Date().toISOString(),
      };
      session?.messages.push(userMessage);

      abortControllerRef.current = new AbortController();
      setStreaming(true);
      setCurrentMessage('');

      await chatService.sendMessage(
        activeSessionId,
        {
          content,
          model,
          outputLength,
          temperature,
          topP,
          topK,
          repetitionPenalty,
        },
        (chunk) => {
          setCurrentMessage((prev) => prev + chunk);
        },
        (error) => {
          console.error('Stream error:', error);
          setStreaming(false);
        }
      );

      // Refetch session to get updated messages
      await refetch();
      setStreaming(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setStreaming(false);
    }
  };

  const handleRetry = async () => {
    const lastUserMessage = session?.messages
      .filter((m) => m.sender === 'user')
      .pop();

    if (lastUserMessage) {
      await handleSendMessage(lastUserMessage.content);
    }
  };

  const handleFeedback = async (
    messageId: number,
    type: 'upvote' | 'downvote'
  ) => {
    try {
      await chatService.addFeedback(messageId, { feedbackType: type });
      await refetch();
    } catch (error) {
      console.error('Error adding feedback:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages, currentMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!activeSessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-secondary">Select or create a chat to begin</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'white',
          },
        }} 
      />
      <span className="m-4 text-h4 text-white">Chat</span>
      <div className="mx-4 my-1 flex-1 overflow-y-auto rounded-2xl bg-surface">
        <div className="flex h-full flex-col justify-between">
          <div
            className="flex-1 overflow-y-auto p-4"
            ref={messagesContainerRef}
          >
            {session?.messages.map((message) =>
              message.sender === 'user' ? (
                <UserMessage key={message.id} content={message.content} />
              ) : (
                <ChatResponse
                  key={message.id}
                  content={message.content}
                  metrics={{
                    tokens: message.tokens || 0,
                    speed: `${message.tokensPerSecond || 0} tokens/s`,
                  }}
                  feedback={message.feedback?.feedbackType}
                  onFeedback={(type) => handleFeedback(message.id, type)}
                />
              )
            )}
            {streaming && currentMessage && (
              <ChatResponse
                content={currentMessage}
                metrics={{ tokens: 0, speed: 'Streaming...' }}
                onFeedback={() => {}}
              />
            )}
          </div>
          <div className="flex justify-end p-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRetry}
              disabled={streaming}
            >
              <FaArrowRotateLeft className="h-4 w-4 text-secondary" />
            </Button>
          </div>
        </div>
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={streaming} />
    </div>
  );
}

export default ChatContainer;
