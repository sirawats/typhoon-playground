import { Button } from '../atoms/Button';
import {
  FaRegThumbsUp,
  FaRegThumbsDown,
  FaRotateLeft,
  FaRegClone,
} from 'react-icons/fa6';

type ChatMessageProps = {
  role: 'system' | 'assistant';
  content: string;
  metrics?: { tokens: number; speed: string };
};

export function ChatMessage({ role, content, metrics }: ChatMessageProps) {
  return (
    <div className="mb-4">
      <div className="rounded-lg bg-gray-900/80 p-4">
        <p className="text-body1 text-white">{content}</p>
      </div>
      {metrics && (
        <div className="mt-2 flex items-center gap-2 text-subtitle text-secondary">
          <span>
            {metrics.tokens} tokens | {metrics.speed}
          </span>
          <Button size="sm" variant="secondary">
            <FaRegThumbsUp className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <FaRegThumbsDown className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <FaRotateLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <FaRegClone className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
