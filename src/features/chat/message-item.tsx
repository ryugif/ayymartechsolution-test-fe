import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Markdown } from '@/components/markdown';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import { Button } from '@/components/ui/button';
import { Message, MessageContent, MessageFooter } from '@/components/ui/message';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Message as ChatMessage } from '@/lib/api/chat';

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy');
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={copied ? 'Copied' : 'Copy'}
                    onClick={() => void copy()}
                >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied' : 'Copy'}</TooltipContent>
        </Tooltip>
    );
}

/** One turn: the user bubble, an assistant reply, or a saved summary. */
export function MessageItem({ message }: { message: ChatMessage }) {
    const time = formatTime(message.createdAt);

    if (message.role === 'USER') {
        return (
            <Message align="end">
                <MessageContent>
                    <Bubble align="end" variant="muted">
                        <BubbleContent className="whitespace-pre-wrap">{message.content}</BubbleContent>
                    </Bubble>
                    <MessageFooter>
                        <span className="text-xs text-muted-foreground">{time}</span>
                    </MessageFooter>
                </MessageContent>
            </Message>
        );
    }

    const isSummary = message.type === 'SUMMARY';
    return (
        <Message>
            <MessageContent className="gap-2">
                {isSummary && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
                )}
                <div className={isSummary ? 'rounded-lg border border-dashed p-4' : undefined}>
                    <Markdown>{message.content}</Markdown>
                </div>
                <MessageFooter>
                    <CopyButton text={message.content} />
                    <span className="text-xs text-muted-foreground">{time}</span>
                </MessageFooter>
            </MessageContent>
        </Message>
    );
}