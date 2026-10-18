import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsQueryOptions } from '@/lib/queries/projects';
import { ProjectFormDialog, type ProjectDialogState } from './project-form-dialog';

export function ProjectsPage() {
    const { data: projects } = useSuspenseQuery(projectsQueryOptions);
    const [dialog, setDialog] = useState<ProjectDialogState>(null);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Projects</h1>
                <Button onClick={() => setDialog({ mode: 'create' })}>New project</Button>
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
                                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Updated {new Date(p.updatedAt).toLocaleDateString()}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setDialog({ mode: 'edit', project: p })}>
                                        Edit
                                    </Button>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                </ul>
            )}

            <ProjectFormDialog state={dialog} onClose={() => setDialog(null)} />
        </div>
    );
}