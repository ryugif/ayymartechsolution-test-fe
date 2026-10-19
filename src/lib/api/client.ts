import { ApiError } from './errors';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

type Options = {
  method?: string;
  json?: unknown;
  signal?: AbortSignal;
};

let onUnauthorized: (() => void) | undefined;

/** Register what happens when any call (except /auth/me) answers AUTH_REQUIRED. */
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

/** Call the API under /api, send the cookie, unwrap `{ data }`, throw ApiError on failure. */
export async function api<T>(path: string, { method = 'GET', json, signal }: Options = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      credentials: 'include',
      signal,
      headers: json === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'Cannot reach the server');
  }

  if (!res.ok) throw await toApiError(res, path);
  const body = await readJson(res);
  return (body as { data: T } | undefined)?.data as T;
}

/** Read an error response, tell the app if the session ended, return an ApiError. */
export async function toApiError(res: Response, path: string): Promise<ApiError> {
  const error = ApiError.fromBody(res.status, await readJson(res));
  if (error.code === 'AUTH_REQUIRED' && path !== '/auth/me') onUnauthorized?.();
  return error;
}