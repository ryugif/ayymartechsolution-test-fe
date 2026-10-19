import { useQueryClient } from '@tanstack/react-query';
import { ArrowUpIcon, SquareIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from '@/components/ui/input-group';
import { useChatStreamStore } from '@/stores/chat-stream';
import { sendMessage, stopStream } from './send-message';

const MAX_LENGTH = 4000; // same limit as the API

/** Text box with send and stop. Enter sends, Shift+Enter adds a new line. */
export function MessageComposer({ projectId }: { projectId: string }) {
    const queryClient = useQueryClient();
    const [text, setText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const streaming = useChatStreamStore((s) => s.status === 'streaming');

    // Put the cursor back in the box when an answer ends
    const wasStreaming = useRef(false);
    useEffect(() => {
        if (wasStreaming.current && !streaming) textareaRef.current?.focus();
        wasStreaming.current = streaming;
    }, [streaming]);

    const submit = () => {
        const content = text.trim();
        if (!content || streaming) return;
        setText('');
        void sendMessage(queryClient, projectId, content);
    };

    const stop = () => {
        const unsent = useChatStreamStore.getState().userText;
        stopStream();
        setText((current) => current || unsent); // nothing was saved, give the text back
        toast('Stopped. Nothing was saved.');
    };

    return (
        <form
            className="shrink-0"
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <InputGroup>
                <InputGroupTextarea
                    ref={textareaRef}
                    value={text}
                    maxLength={MAX_LENGTH}
                    rows={1}
                    className="max-h-48"
                    aria-label="Message"
                    placeholder="Ask about colours, materials or finishes..."
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                            e.preventDefault();
                            submit();
                        }
                    }}
                />
                <InputGroupAddon align="block-end">
                    {text.length > MAX_LENGTH * 0.8 && (
                        <span className="text-xs text-muted-foreground">
                            {text.length}/{MAX_LENGTH}
                        </span>
                    )}
                    {streaming ? (
                        <InputGroupButton
                            type="button"
                            variant="default"
                            size="icon-sm"
                            className="ml-auto rounded-full"
                            aria-label="Stop"
                            onClick={stop}
                        >
                            <SquareIcon />
                        </InputGroupButton>
                    ) : (
                        <InputGroupButton
                            type="submit"
                            variant="default"
                            size="icon-sm"
                            className="ml-auto rounded-full"
                            aria-label="Send"
                            disabled={!text.trim()}
                        >
                            <ArrowUpIcon />
                        </InputGroupButton>
                    )}
                </InputGroupAddon>
            </InputGroup>
        </form>
    );
}