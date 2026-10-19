import { useQueryClient } from '@tanstack/react-query';
import { Markdown } from '@/components/markdown';
import { Button } from '@/components/ui/button';
import { Message, MessageContent } from '@/components/ui/message';
import { useChatStreamStore } from '@/stores/chat-stream';
import { sendMessage } from './send-message';

/** The assistant answer while it streams, or the error if it failed. */
export function PendingAssistantMessage({ projectId }: { projectId: string }) {
    const queryClient = useQueryClient();
    const text = useChatStreamStore((s) => s.assistantText);
    const status = useChatStreamStore((s) => s.status);
    const error = useChatStreamStore((s) => s.error);
    const userText = useChatStreamStore((s) => s.userText);

    return (
        <Message>
            <MessageContent className="gap-2">
                {text ? (
                    <Markdown>{text}</Markdown>
                ) : (
                    status === 'streaming' && <p className="animate-pulse text-sm text-muted-foreground">Thinking...</p>
                )}
                {error && (
                    <div role="alert" className="space-y-2 rounded-lg border border-destructive/40 p-3">
                        <p className="text-sm text-destructive">{error.message}</p>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void sendMessage(queryClient, projectId, userText)}
                        >
                            Try again
                        </Button>
                    </div>
                )}
            </MessageContent>
        </Message>
    );
}