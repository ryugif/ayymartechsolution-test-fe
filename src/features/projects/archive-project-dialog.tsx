import { ConfirmDialog } from '@/components/confirm-dialog';
import type { Project } from '@/lib/api/projects';
import { useArchiveProject } from '@/lib/queries/projects';

type Props = {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

/** Confirm dialog before hiding a project from the list. Nothing is deleted. */
export function ArchiveProjectDialog({ project, open, onOpenChange }: Props) {
    const archive = useArchiveProject();

    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Archive this project?"
            description={
                <>
                    "{project.title}" will be hidden from your project list. Its conversation and design
                    context are kept, and you can undo this right after.
                </>
            }
            confirmLabel="Archive project"
            pendingLabel="Archiving..."
            isPending={archive.isPending}
            onConfirm={() => archive.mutate(project.id, { onSuccess: () => onOpenChange(false) })}
        />
    );
}