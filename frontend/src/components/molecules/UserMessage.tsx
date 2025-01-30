type UserMessageProps = {
  content: string;
};

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="mb-4 flex justify-end">
      <div className="max-w-2xl rounded-3xl rounded-br-[0px] bg-background p-4">
        <p className="text-h5">{content}</p>
      </div>
    </div>
  );
}
