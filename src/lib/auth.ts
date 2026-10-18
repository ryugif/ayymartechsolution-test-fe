import { queryOptions } from '@tanstack/react-query';
import { authApi } from '@/lib/api/auth';

export const meQueryOptions = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: authApi.me,
  staleTime: 2 * 60 * 1000,
  retry: false,
});

/** Only allow in-app paths as post-login target. Blocks open redirects. */
export function safeRedirect(target: string | undefined): string | undefined {
  return target && target.startsWith('/') && !target.startsWith('//') ? target : undefined;
}