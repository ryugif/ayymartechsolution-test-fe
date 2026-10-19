import { toApiError } from './api/client';
import { ApiError } from './api/errors';

export type SseMessage = { event: string; data: unknown };

type Options = {
  json?: unknown;
  signal?: AbortSignal;
  onEvent: (message: SseMessage) => void;
};

function isAbort(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

function parseBlock(block: string): SseMessage | undefined {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith(':')) continue; // comment or keep-alive
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).replace(/^ /, ''));
  }
  if (dataLines.length === 0) return undefined;
  try {
    return { event, data: JSON.parse(dataLines.join('\n')) as unknown };
  } catch {
    return undefined;
  }
}

/** POST, then read a text/event-stream body. Resolves when the stream ends. */
export async function postSse(path: string, { json, signal, onEvent }: Options): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: 'POST',
      credentials: 'include',
      signal,
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify(json ?? {}),
    });
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server');
  }

  // Failures before the stream opens are plain JSON errors
  if (!res.ok) throw await toApiError(res, path);
  if (!res.body) throw new ApiError(0, 'NETWORK_ERROR', 'No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      // A network chunk can hold half an event or several events: split on the blank line
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      let end = buffer.indexOf('\n\n');
      while (end !== -1) {
        const message = parseBlock(buffer.slice(0, end));
        buffer = buffer.slice(end + 2);
        if (message) onEvent(message);
        end = buffer.indexOf('\n\n');
      }
    }
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Connection lost');
  }
}