type HistoryItemProps = {
    title: string
    isActive?: boolean
    onClick?: () => void
   }
   
   export function HistoryItem({ title, isActive, onClick }: HistoryItemProps) {
    return (
      <button
        onClick={onClick}
        className={`w-full rounded-lg p-3 text-left text-h6 transition-colors ${
          isActive 
            ? 'text-primary' 
            : 'text-white hover:bg-gray-800/50'
        }`}
      >
        {title}
      </button>
    )
   }