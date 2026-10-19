import { ConfirmDialog } from '@/components/confirm-dialog';
import { useResetConversation } from '@/lib/queries/chat';

type Props = {
    projectId: string;
    projectTitle?: string;
    messageCount?: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/** Confirm dialog that clears a chat but keeps the project. */
export function ResetConversationDialog({ projectId, projectTitle, messageCount, open, onOpenChange }: Props) {
    const reset = useResetConversation(projectId);

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Reset this conversation?"
            description={
                <>
                    This deletes {messageCount === undefined ? 'all messages' : `all ${messageCount} messages`}
                    {projectTitle ? ` in "${projectTitle}"` : ''}, including saved summaries, so you can start
                    fresh. The project and its design context stay. This cannot be undone.
                </>
            }
            confirmLabel="Reset conversation"
            pendingLabel="Resetting..."
            isPending={reset.isPending}
            destructive
            onConfirm={() => reset.mutate(undefined, { onSuccess: () => onOpenChange(false) })}
        />
    );
}