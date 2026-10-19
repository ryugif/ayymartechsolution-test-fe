import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { chatApi, type Message } from '@/lib/api/chat';
import { ApiError } from '@/lib/api/errors';
import { projectKeys } from './projects';
import { useChatStreamStore } from '../../stores/chat-stream';

export const messagesQueryOptions = (projectId: string) =>
  queryOptions({
    queryKey: projectKeys.messages(projectId),
    queryFn: () => chatApi.list(projectId),
  });

  export function useSummarise(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.summarise(projectId),
    onSuccess: (summary) => {
      queryClient.setQueryData<Message[]>(projectKeys.messages(projectId), (old) => [
        ...(old ?? []),
        summary,
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not create the summary');
    },
  });
}

/** Delete every message of a project. The project itself stays. */
export function useResetConversation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => chatApi.reset(projectId),
    onSuccess: () => {
      useChatStreamStore.getState().clear();
      queryClient.setQueryData<Message[]>(projectKeys.messages(projectId), []);
      toast.success('Conversation reset');
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not reset the conversation');
    },
  });
}