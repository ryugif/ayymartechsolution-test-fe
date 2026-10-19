import type { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';
import type { Message, SendMessageResult } from '@/lib/api/chat';
import { projectKeys } from '@/lib/queries/projects';
import { postSse } from '@/lib/sse';
import { useChatStreamStore, type StreamError } from '@/stores/chat-stream';

/** Send a message and stream the answer. Resolves true when the exchange was saved. */
export async function sendMessage(
    queryClient: QueryClient,
    projectId: string,
    content: string,
): Promise<boolean> {
    const store = useChatStreamStore.getState();
    if (store.status === 'streaming') return false;

    const controller = new AbortController();
    store.start(projectId, content, controller);

    // Holder object, because TypeScript cannot see assignments made inside callbacks
    const result: { saved?: SendMessageResult; error?: StreamError } = {};

    try {
        await postSse(`/projects/${projectId}/messages/stream`, {
            json: { content },
            signal: controller.signal,
            onEvent: ({ event, data }) => {
                if (event === 'token') store.append((data as { text: string }).text);
                else if (event === 'done') result.saved = data as SendMessageResult;
                else if (event === 'error') result.error = data as StreamError;
            },
        });
    } catch (err) {
        if (controller.signal.aborted) {
            store.clear(); // stopped or left the page: the server saved nothing
            return false;
        }
        const apiError = err instanceof ApiError ? err : new ApiError(0, 'NETWORK_ERROR', 'Connection lost');
        store.fail({ message: apiError.message, code: apiError.code });
        return false;
    }

    if (result.saved) {
        const { userMessage, assistantMessage } = result.saved;
        queryClient.setQueryData<Message[]>(projectKeys.messages(projectId), (old) => [
            ...(old ?? []),
            userMessage,
            assistantMessage,
        ]);
        store.finish(userMessage.id);
        // Project moved to the top of the list (updatedAt changed)
        void queryClient.invalidateQueries({ queryKey: projectKeys.all, exact: true });
        return true;
    }

    store.fail(
        result.error ?? { message: 'The answer was cut off, please try again', code: 'STREAM_INTERRUPTED' },
    );
    return false;
}

/** Stop button: abort the request. The server discards the unfinished answer. */
export function stopStream() {
    useChatStreamStore.getState().controller?.abort();
}

/** Leaving the chat page: abort and drop any in-flight or failed exchange. */
export function leaveChat() {
    const state = useChatStreamStore.getState();
    state.controller?.abort();
    state.clear();
}