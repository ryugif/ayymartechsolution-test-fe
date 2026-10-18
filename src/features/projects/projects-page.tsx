import { useSuspenseQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsQueryOptions } from '@/lib/queries/projects';

export function ProjectsPage() {
    const { data: projects } = useSuspenseQuery(projectsQueryOptions);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Projects ({projects.length})</h1>
                <Button disabled>New project</Button>
            </div>

            {projects.length === 0 ? (
                <p className="text-muted-foreground">No projects yet. Create your first design project.</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((p) => (
                        <li key={p.id}>
                            <Card className="h-full">
                                <CardHeader>
                                    <CardTitle className="line-clamp-1">{p.title}</CardTitle>
                                    <CardDescription className="line-clamp-3">
                                        {p.description ?? 'No design context yet'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="text-xs text-muted-foreground">
                                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}