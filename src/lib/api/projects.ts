import { api } from './client';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
};
export type ProjectInput = { title: string; description?: string };
export type UpdateProjectInput = Partial<ProjectInput>;

export const projectsApi = {
  list: () => api<Project[]>('/projects'),
  get: (id: string) => api<Project>(`/projects/${id}`),
  create: (input: ProjectInput) => api<Project>('/projects', { method: 'POST', json: input }),
  update: (id: string, input: UpdateProjectInput) => api<Project>(`/projects/${id}`, { method: 'PATCH', json: input }),
  archive: (id: string) => api<Project>(`/projects/${id}/archive`, { method: 'POST' }),
  unarchive: (id: string) => api<Project>(`/projects/${id}/unarchive`, { method: 'POST' }),
};