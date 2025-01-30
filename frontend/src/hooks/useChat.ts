import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat';
import type {
  ChatSessionResponseDTO,
  CreateSessionRequestDTO,
  UpdateSessionRequestDTO,
} from '@/types/dtos/chat';

export function useChatSessions() {
  const queryClient = useQueryClient();

  const { data: sessions, isLoading } = useQuery<ChatSessionResponseDTO[]>({
    queryKey: ['chat-sessions'],
    queryFn: () => chatService.getSessions(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateSessionRequestDTO) =>
      chatService.createSession(data),
    onSuccess: (newSession) => {
      queryClient.setQueryData(
        ['chat-sessions'],
        (old: ChatSessionResponseDTO[] | undefined) => {
          return old ? [newSession, ...old] : [newSession];
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: chatService.deleteSession,
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(
        ['chat-sessions'],
        (old: ChatSessionResponseDTO[] | undefined) => {
          return old?.filter((session) => session.id !== deletedId) ?? [];
        }
      );
    },
  });

  return {
    sessions,
    isLoading,
    createSession: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteSession: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useSession(sessionId: number) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSessionRequestDTO}) =>
      chatService.updateSession(id, data),
    onSuccess: (updatedSession) => {
      // Update the individual session cache
      queryClient.setQueryData(
        ['chat-session', sessionId],
        (old: ChatSessionResponseDTO | undefined) => ({
          ...old,
          ...updatedSession,
        })
      );
      
      // Update the session in the sessions list cache
      queryClient.setQueryData(
        ['chat-sessions'],
        (old: ChatSessionResponseDTO[] | undefined) => {
          return old?.map((session) =>
            session.id === sessionId ? { ...session, ...updatedSession } : session
          );
        }
      );
    },
  });

  return {
    data: useQuery<ChatSessionResponseDTO>({
      queryKey: ['chat-session', sessionId],
      queryFn: () => chatService.getSession(sessionId),
      enabled: !!sessionId,
    }).data,
    updateSession: updateMutation.mutate,
    refetch: useQuery<ChatSessionResponseDTO>({
      queryKey: ['chat-session', sessionId],
      queryFn: () => chatService.getSession(sessionId),
      enabled: !!sessionId,
    }).refetch,
  };
}
