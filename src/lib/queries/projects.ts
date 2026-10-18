import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type UpdateProjectInput } from '@/lib/api/projects';
import { toast } from 'sonner';
import { ApiError } from '../api/errors';

export const projectKeys = {
  all: ['projects'] as const,
};

export const projectsQueryOptions = queryOptions({
  queryKey: projectKeys.all,
  queryFn: projectsApi.list,
});

/** Create a project, then refresh the list. */
export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project created');
    },
  });
}

/** Update a project, then refresh the list. */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & UpdateProjectInput) => projectsApi.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project updated');
    },
    onError: (error) => {
      // Deleted elsewhere: the list is stale, refresh it
      if (error instanceof ApiError && error.code === 'PROJECT_NOT_FOUND') {
        void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      }
    },
  });
}