import { createFileRoute } from '@tanstack/react-router';
import { projectsQueryOptions } from '@/lib/queries/projects';
import { ProjectsError } from '@/features/projects/projects-error';
import { ProjectsPage } from '@/features/projects/projects-page';


export const Route = createFileRoute('/_authed/projects/')({
    loader: ({ context }) => context.queryClient.ensureQueryData(projectsQueryOptions),
    errorComponent: ProjectsError,
    component: () => <ProjectsPage />,
});