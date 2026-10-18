import { queryOptions } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api/projects';

export const projectKeys = {
  all: ['projects'] as const,
};

export const projectsQueryOptions = queryOptions({
  queryKey: projectKeys.all,
  queryFn: projectsApi.list,
});