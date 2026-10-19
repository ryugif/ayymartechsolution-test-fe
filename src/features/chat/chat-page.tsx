import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from '@/components/ui/message-scroller';
import { messagesQueryOptions } from '@/lib/queries/chat';
import { projectQueryOptions } from '@/lib/queries/projects';
import { useChatStreamStore } from '@/stores/chat-stream';
import { MessageComposer } from './message-composer';
import { MessageItem } from './message-item';
import { PendingAssistantMessage } from './pending-assistant-message';
import { leaveChat } from './send-message';
import { ArrowLeft, LoaderCircleIcon, SparklesIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSummarise } from '@/lib/queries/chat';
import { ResetConversationDialog } from './reset-conversation-dialog';

export function ChatPage() {
    const { projectId } = useParams({ from: '/_authed/projects/$projectId' });
    const { data: project } = useSuspenseQuery(projectQueryOptions(projectId));
    const { data: messages } = useSuspenseQuery(messagesQueryOptions(projectId));
    const [resetOpen, setResetOpen] = useState(false);

    const summarise = useSummarise(projectId);
    const hasChat = messages.some((m) => m.type === 'CHAT');

    const status = useChatStreamStore((s) => s.status);
    const streamProjectId = useChatStreamStore((s) => s.projectId);
    const userText = useChatStreamStore((s) => s.userText);
    const startedAt = useChatStreamStore((s) => s.startedAt);
    const lastSentUserId = useChatStreamStore((s) => s.lastSentUserId);

    const pending = streamProjectId === projectId && status !== 'idle';
    const busy = status === 'streaming' || summarise.isPending;

    // Leaving the page cancels the request, the server then saves nothing
    useEffect(() => () => leaveChat(), [projectId]);

    return (
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4">
            <div className="flex shrink-0 items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                    <Link to="/projects" className="text-sm text-muted-foreground hover:underline">
                        <ArrowLeft className="mr-1 inline h-4 w-4" />
                        All projects
                    </Link>
                    <h1 className="text-2xl font-bold">{project.title}</h1>
                    {project.description && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    )}
                </div>
                {messages.length > 0 && (
                    <>
                        <Button variant="ghost" size="sm" disabled={busy} onClick={() => setResetOpen(true)}>
                            <Trash2Icon />
                            Reset
                        </Button>
                        <ResetConversationDialog
                            projectId={projectId}
                            messageCount={messages.length}
                            open={resetOpen}
                            onOpenChange={setResetOpen}
                        />
                    </>
                )}
            </div>

            {messages.length === 0 && !pending ? (
                <div className="flex flex-1 items-center justify-center text-center text-muted-foreground">
                    No messages yet. Ask the assistant about colours, materials or finishes.
                </div>
            ) : (
                <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor" scrollPreviousItemPeek={64}>
                    <MessageScroller className="min-h-0 flex-1">
                        <MessageScrollerViewport>
                            <MessageScrollerContent className="gap-4 py-2" aria-busy={status === 'streaming'}>
                                {messages.map((m) => (
                                    <MessageScrollerItem
                                        key={m.id}
                                        messageId={m.id}
                                        // The message just sent was already anchored while pending
                                        scrollAnchor={m.role === 'USER' && m.id !== lastSentUserId}
                                    >
                                        <MessageItem message={m} />
                                    </MessageScrollerItem>
                                ))}
                                {pending && (
                                    <>
                                        <MessageScrollerItem key="pending-user" messageId="pending-user" scrollAnchor>
                                            <MessageItem
                                                message={{
                                                    id: 'pending-user',
                                                    projectId,
                                                    role: 'USER',
                                                    type: 'CHAT',
                                                    content: userText,
                                                    createdAt: startedAt,
                                                }}
                                            />
                                        </MessageScrollerItem>
                                        <MessageScrollerItem key="pending-assistant" messageId="pending-assistant">
                                            <PendingAssistantMessage projectId={projectId} />
                                        </MessageScrollerItem>
                                    </>
                                )}
                            </MessageScrollerContent>
                        </MessageScrollerViewport>
                        <MessageScrollerButton />
                    </MessageScroller>
                </MessageScrollerProvider>
            )}

            <div className="shrink-0 space-y-2">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || !hasChat}
                        onClick={() => summarise.mutate()}
                    >
                        {summarise.isPending ? <LoaderCircleIcon className="animate-spin" /> : <SparklesIcon />}
                        {summarise.isPending ? 'Summarising...' : 'Summarise decisions'}
                    </Button>
                </div>
                <MessageComposer projectId={projectId} />
            </div>
        </div>
    );
}