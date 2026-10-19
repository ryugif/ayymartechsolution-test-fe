import { createFileRoute } from '@tanstack/react-router';
import { ChatError } from '@/features/chat/chat-error';
import { ChatPage } from '@/features/chat/chat-page';
import { messagesQueryOptions } from '@/lib/queries/chat';
import { projectQueryOptions } from '@/lib/queries/projects';

export const Route = createFileRoute('/_authed/projects/$projectId')({
    loader: async ({ context, params }) => {
        await Promise.all([
            context.queryClient.ensureQueryData(projectQueryOptions(params.projectId)),
            context.queryClient.ensureQueryData(messagesQueryOptions(params.projectId)),
        ]);
    },
    errorComponent: ChatError,
    component: () => <ChatPage />,
});