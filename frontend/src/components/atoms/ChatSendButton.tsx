import clsx from 'clsx';

type ChatSendButtonProps = {
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function ChatSendButton({ children }: ChatSendButtonProps) {
  return (
    <div
      className={clsx(
        'relative inline-block',
        'rounded-full p-[1px]',
        'before:absolute before:inset-0',
        'before:rounded-full',
        'before:bg-gradient-to-r',
        'before:from-[#A77BE8]',
        'before:via-[#F0BFAA]',
        'before:to-[#6CA1C7]',
        'before:blur-[1px]' // Small blur for soft gradient edge
      )}
    >
      <button
        className={clsx(
          'relative',
          'p-3 px-6',
          'rounded-full',
          'bg-background',
          'text-white',
          'hover:text-primary',
          'h-full w-full'
        )}
      >
        <span className="flex items-center gap-2">{children}</span>
      </button>
    </div>
  );
}
