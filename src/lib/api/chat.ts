import { api } from './client';

export type Message = {
  id: string;
  projectId: string;
  role: 'USER' | 'ASSISTANT';
  type: 'CHAT' | 'SUMMARY';
  content: string;
  createdAt: string;
};

export type SendMessageResult = {
  userMessage: Message;
  assistantMessage: Message;
};

export const chatApi = {
  list: (projectId: string) => api<Message[]>(`/projects/${projectId}/messages`),
  summarise: (projectId: string) =>
  api<Message>(`/projects/${projectId}/summary`, { method: 'POST' }),
  reset: (projectId: string) =>
  api<null>(`/projects/${projectId}/messages`, { method: 'DELETE' }),
};