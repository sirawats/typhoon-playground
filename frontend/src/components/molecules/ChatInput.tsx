'use client';

import { useState } from 'react';
import { ChatSendButton } from '../atoms/ChatSendButton';
import { FaPaperPlane } from 'react-icons/fa';

type ChatInputProps = {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        className="w-full rounded-full bg-surface px-6 py-2 text-body2 text-white placeholder:text-secondary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        placeholder={
          disabled ? 'Waiting for response...' : 'Enter text here...'
        }
      />
      <ChatSendButton type="submit" disabled={disabled}>
        <FaPaperPlane className="h-4 w-4" />
        Send
      </ChatSendButton>
    </form>
  );
}
