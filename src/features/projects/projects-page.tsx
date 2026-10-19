import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ResetConversationDialog } from '@/features/chat/reset-conversation-dialog';
import { Button } from '@/components/ui/button';
import type { Project } from '@/lib/api/projects';
import { projectsQueryOptions } from '@/lib/queries/projects';
import { ArchiveProjectDialog } from './archive-project-dialog';
import { ProjectCard } from './project-card';
import { ProjectFormDialog, type ProjectDialogState } from './project-form-dialog';

export function ProjectsPage() {
    const { data: projects } = useSuspenseQuery(projectsQueryOptions);
    const [dialog, setDialog] = useState<ProjectDialogState>(null);
    const [resetTarget, setResetTarget] = useState<Project | null>(null);
    const [archiveTarget, setArchiveTarget] = useState<Project | null>(null);

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
                            <ProjectCard
                                project={p}
                                onEdit={() => setDialog({ mode: 'edit', project: p })}
                                onReset={() => setResetTarget(p)}
                                onArchive={() => setArchiveTarget(p)}
                            />
                        </li>
                    ))}
                </ul>
            )}

            <ProjectFormDialog state={dialog} onClose={() => setDialog(null)} />

            {resetTarget && (
                <ResetConversationDialog
                    key={resetTarget.id}
                    projectId={resetTarget.id}
                    projectTitle={resetTarget.title}
                    open
                    onOpenChange={(open) => {
                        if (!open) setResetTarget(null);
                    }}
                />
            )}

            {archiveTarget && (
                <ArchiveProjectDialog
                    key={archiveTarget.id}
                    project={archiveTarget}
                    open
                    onOpenChange={(open) => {
                        if (!open) setArchiveTarget(null);
                    }}
                />
            )}
        </div>
    );
}