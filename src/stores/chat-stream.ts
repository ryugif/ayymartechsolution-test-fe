import { create } from 'zustand';

export type StreamError = { message: string; code: string };

type ChatStreamState = {
  projectId: string | null;
  status: 'idle' | 'streaming' | 'error';
  userText: string;
  startedAt: string;
  assistantText: string;
  error: StreamError | null;
  controller: AbortController | null;
  /** Id of the user message just saved, so the scroller does not re-anchor on it. */
  lastSentUserId: string | null;
  start: (projectId: string, userText: string, controller: AbortController) => void;
  append: (text: string) => void;
  fail: (error: StreamError) => void;
  finish: (userMessageId: string) => void;
  clear: () => void;
};

const empty = {
  projectId: null,
  status: 'idle' as const,
  userText: '',
  startedAt: '',
  assistantText: '',
  error: null,
  controller: null,
};

export const useChatStreamStore = create<ChatStreamState>()((set) => ({
  ...empty,
  lastSentUserId: null,
  start: (projectId, userText, controller) =>
    set({
      projectId,
      status: 'streaming',
      userText,
      startedAt: new Date().toISOString(),
      assistantText: '',
      error: null,
      controller,
    }),
  append: (text) => set((s) => ({ assistantText: s.assistantText + text })),
  fail: (error) => set({ status: 'error', error, controller: null }),
  finish: (userMessageId) => set({ ...empty, lastSentUserId: userMessageId }),
  clear: () => set({ ...empty }),
}));