import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type UpdateProjectInput } from '@/lib/api/projects';
import { toast } from 'sonner';
import { ApiError } from '../api/errors';

export const projectKeys = {
  all: ['projects'] as const,
  detail: (id: string) => ['projects', id] as const,
  messages: (id: string) => ['projects', id, 'messages'] as const,
};

export const projectsQueryOptions = queryOptions({
  queryKey: projectKeys.all,
  queryFn: projectsApi.list,
});

export const projectQueryOptions = (id: string) =>
  queryOptions({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.get(id),
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

/** Archive a project. A toast offers Undo. */
export function useArchiveProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.archive(id),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      toast.success('Project archived', {
        action: {
          label: 'Undo',
          onClick: () => {
            projectsApi
              .unarchive(project.id)
              .then(() => queryClient.invalidateQueries({ queryKey: projectKeys.all }))
              .catch(() => toast.error('Could not restore the project'));
          },
        },
      });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'Could not archive the project');
    },
  });
}