import { api } from './client';

export type Project = {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export const projectsApi = {
  list: () => api<Project[]>('/projects'),
};