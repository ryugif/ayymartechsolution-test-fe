import { api } from './client';

export type AuthUser = { id: string; email: string };

export const authApi = {
  me: () => api<AuthUser>('/auth/me'),
  login: (input: { email: string; password: string }) =>
    api<AuthUser>('/auth/login', { method: 'POST', json: input }),
  logout: () => api<null>('/auth/logout', { method: 'POST' }),
};