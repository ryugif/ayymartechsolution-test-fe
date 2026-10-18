import { api } from './client';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};
export type ProjectInput = { title: string; description?: string };
export type UpdateProjectInput = Partial<ProjectInput>;

export const projectsApi = {
  list: () => api<Project[]>('/projects'),
  create: (input: ProjectInput) => api<Project>('/projects', { method: 'POST', json: input }),
  update: (id: string, input: UpdateProjectInput) =>
    api<Project>(`/projects/${id}`, { method: 'PATCH', json: input }),
};