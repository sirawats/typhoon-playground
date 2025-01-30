import { useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { FaPlus, FaTrash } from 'react-icons/fa6';
import { Button } from '../atoms/Button';
import { HistoryItem } from '../atoms/HistoryItem';
import { useChatSessions } from '@/hooks/useChat';
import { useChatStore } from '@/store/chat';
import { FaTimes } from 'react-icons/fa';

interface HistoryProps {
  onClose?: () => void;
}

export function History({ onClose }: HistoryProps) {
  const { sessions, isLoading, createSession, deleteSession } =
    useChatSessions();
  const { activeSessionId, setActiveSession } = useChatStore();

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    if (!sessions) return {};

    return sessions.reduce(
      (acc, session) => {
        const date = format(new Date(session.createdAt), 'MMM d, yyyy');
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(session);
        return acc;
      },
      {} as Record<string, typeof sessions>
    );
  }, [sessions]);

  // Move this to useEffect instead of useMemo
  useEffect(() => {
    if (sessions?.length && !activeSessionId) {
      setActiveSession(sessions[0].id);
    }
  }, [sessions, activeSessionId, setActiveSession]);

  const handleNewChat = () => {
    createSession(
      { title: 'New Chat' },
      {
        onSuccess: (newSession) => {
          setActiveSession(newSession.id);
          // Close the history panel on mobile after creating new chat
          onClose?.();
        },
      }
    );
  };

  const handleDeleteChat = async (sessionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessionId === activeSessionId) {
      setActiveSession(null);
    }
    deleteSession(sessionId);
  };

  const handleSelectSession = (sessionId: number) => {
    setActiveSession(sessionId);
    // Close the history panel on mobile after selecting a chat
    onClose?.();
  };

  return (
    <aside className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h6 font-semibold text-secondary">History</h2>
        <button
          onClick={onClose}
          className="p-2 text-secondary transition-colors hover:text-white md:hidden"
          aria-label="Close history"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </div>

      <Button
        onClick={handleNewChat}
        className="mb-4 flex w-full items-center justify-center gap-2 p-2"
      >
        <FaPlus className="h-4 w-4" />
        New Chat
      </Button>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="text-secondary">Loading...</div>
        </div>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date}>
              <h3 className="mb-2 text-subtitle text-secondary">{date}</h3>
              <div className="space-y-1">
                {dateSessions?.map((session) => (
                  <div key={session.id} className="group relative">
                    <HistoryItem
                      title={session.title}
                      isActive={session.id === activeSessionId}
                      onClick={() => handleSelectSession(session.id)}
                    />
                    <button
                      onClick={(e) => handleDeleteChat(session.id, e)}
                      className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-secondary opacity-0 transition-opacity hover:text-red-500 group-hover:block group-hover:opacity-100"
                      aria-label="Delete chat"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {sessions?.length === 0 && (
            <div className="text-center text-secondary">
              No chats yet. Start a new conversation!
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
