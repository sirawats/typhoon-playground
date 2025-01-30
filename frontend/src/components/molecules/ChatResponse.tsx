import { Button } from '../atoms/Button';
import { FaRegThumbsUp, FaRegThumbsDown, FaRegClone } from 'react-icons/fa6';
import toast from 'react-hot-toast';

interface ChatResponseProps {
  content: string;
  metrics: {
    tokens: number;
    speed: string;
  };
  feedback?: 'upvote' | 'downvote';
  onFeedback: (feedback: 'upvote' | 'downvote') => void;
}

export function ChatResponse({
  content,
  metrics,
  feedback,
  onFeedback,
}: ChatResponseProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard!', {
        duration: 1000,
      });
    } catch (err) {
      console.error('Failed to copy text:', err);
      toast.error('Failed to copy message');
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between rounded-lg p-1">
        <p className="text-h5">{content}</p>
        <Button size="sm" variant="ghost" onClick={handleCopy}>
          <FaRegClone className="h-4 w-4 text-secondary" />
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-2 pl-2 text-subtitle text-secondary">
        <Button size="sm" variant="ghost" onClick={() => onFeedback('upvote')}>
          <FaRegThumbsUp
            className={`h-4 w-4 ${feedback === 'upvote' ? 'text-primary' : 'text-secondary'}`}
          />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onFeedback('downvote')}
        >
          <FaRegThumbsDown
            className={`h-4 w-4 ${feedback === 'downvote' ? 'text-primary' : 'text-secondary'}`}
          />
        </Button>
        <span>
          {metrics.tokens} tokens | {metrics.speed}
        </span>
      </div>
    </div>
  );
}
