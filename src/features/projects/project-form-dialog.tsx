import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Project } from '@/lib/api/projects';
import { ApiError } from '@/lib/api/errors';
import { useCreateProject, useUpdateProject } from '@/lib/queries/projects';

export type ProjectDialogState = { mode: 'create' } | { mode: 'edit'; project: Project } | null;

const TITLE_MAX = 120;
const DESCRIPTION_MAX = 2000;

type Props = {
    state: ProjectDialogState;
    onClose: () => void;
};

/** Modal to create a project or edit an existing one. */
export function ProjectFormDialog({ state, onClose }: Props) {
    return (
        <Dialog
            open={state !== null}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                {state && <ProjectForm project={state.mode === 'edit' ? state.project : undefined} onDone={onClose} />}
            </DialogContent>
        </Dialog>
    );
}

function ProjectForm({ project, onDone }: { project?: Project; onDone: () => void }) {
    // Dialog content unmounts when closed, so this state resets on every open
    const [title, setTitle] = useState(project?.title ?? '');
    const [description, setDescription] = useState(project?.description ?? '');
    const [showErrors, setShowErrors] = useState(false);

    const create = useCreateProject();
    const update = useUpdateProject();
    const pending = create.isPending || update.isPending;
    const rawError = project ? update.error : create.error;
    const error = rawError instanceof ApiError ? rawError : undefined;

    const titleError =
        (showErrors && !title.trim() ? 'Title is required' : undefined) ?? error?.errors?.title?.[0];
    const descriptionError = error?.errors?.description?.[0];
    const generalError = error && error.code !== 'VALIDATION_ERROR' ? error.message : undefined;

    const submit = () => {
        setShowErrors(true);
        if (!title.trim()) return;
        const input = { title: title.trim(), description: description.trim() };
        if (project) update.mutate({ id: project.id, ...input }, { onSuccess: onDone });
        else create.mutate(input, { onSuccess: onDone });
    };

    return (
        <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
                e.preventDefault();
                submit();
            }}
        >
            <DialogHeader>
                <DialogTitle>{project ? 'Edit project' : 'New project'}</DialogTitle>
                <DialogDescription>
                    Give the project a title and describe the design context the assistant should know.
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
                <Label htmlFor="project-title">Title</Label>
                <Input
                    id="project-title"
                    value={title}
                    maxLength={TITLE_MAX}
                    onChange={(e) => setTitle(e.target.value)}
                    aria-invalid={!!titleError}
                    placeholder="Premium SUV interior"
                />
                {titleError && <p className="text-sm text-destructive">{titleError}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="project-description">Design context (optional)</Label>
                <Textarea
                    id="project-description"
                    rows={5}
                    value={description}
                    maxLength={DESCRIPTION_MAX}
                    onChange={(e) => setDescription(e.target.value)}
                    aria-invalid={!!descriptionError}
                    placeholder="Warm earth tones, matte leather, premium SUV interior"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-destructive">{descriptionError}</span>
                    <span>
                        {description.length}/{DESCRIPTION_MAX}
                    </span>
                </div>
            </div>

            {generalError && (
                <p role="alert" className="text-sm text-destructive">
                    {generalError}
                </p>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                    {pending ? 'Saving...' : project ? 'Save changes' : 'Create project'}
                </Button>
            </DialogFooter>
        </form>
    );
}