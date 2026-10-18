import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/projects/')({
    component: () => <h1 className="text-2xl font-bold">Projects</h1>,
});