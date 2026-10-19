import { afterEach, describe, expect, it, vi } from 'vitest';
import { postSse, type SseMessage } from './sse';

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function read(...chunks: string[]) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(streamOf(...chunks), { status: 200 })));
  const events: SseMessage[] = [];
  await postSse('/projects/p1/messages/stream', { onEvent: (m) => events.push(m) });
  return events;
}

afterEach(() => vi.unstubAllGlobals());

describe('postSse', () => {
  it('reassembles events that are split across network chunks', async () => {
    const events = await read(
      'event: token\ndata: {"te',
      'xt":"Hel"}\n\nevent: token\nda',
      'ta: {"text":"lo"}\n\nevent: done\ndata: {"ok":true}\n\n',
    );

    expect(events).toEqual([
      { event: 'token', data: { text: 'Hel' } },
      { event: 'token', data: { text: 'lo' } },
      { event: 'done', data: { ok: true } },
    ]);
  });

  it('handles CRLF line endings', async () => {
    const events = await read('event: token\r\ndata: {"text":"x"}\r\n\r\n');

    expect(events).toEqual([{ event: 'token', data: { text: 'x' } }]);
  });

  it('ignores comments and malformed blocks', async () => {
    const events = await read(
      ': keep-alive\n\n',
      'event: token\ndata: not-json\n\n',
      'event: token\ndata: {"text":"ok"}\n\n',
    );

    expect(events).toEqual([{ event: 'token', data: { text: 'ok' } }]);
  });

  it('throws an ApiError with the server code when the request is refused', async () => {
    const body = JSON.stringify({ message: 'Project not found', code: 'PROJECT_NOT_FOUND' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { status: 404 })));

    await expect(postSse('/projects/x/messages/stream', { onEvent: () => {} })).rejects.toMatchObject({
      status: 404,
      code: 'PROJECT_NOT_FOUND',
    });
  });
});