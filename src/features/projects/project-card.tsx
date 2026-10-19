import { ArchiveIcon, EllipsisIcon, Folder, FolderOpen, PencilIcon, Trash2Icon } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/lib/api/projects';

type Props = {
    project: Project;
    onEdit: () => void;
    onReset: () => void;
    onArchive: () => void;
};

/** A project card. The whole card opens the chat, the 3-dots menu holds actions. */
export function ProjectCard({ project: p, onEdit, onReset, onArchive }: Props) {
    return (
        <Card className="group relative h-full transition-colors hover:bg-accent/40">
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${p.title}`}
                        className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
                    >
                        <EllipsisIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <PencilIcon />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onReset}>
                        <Trash2Icon />
                        Reset conversation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onArchive}>
                        <ArchiveIcon />
                        Archive project
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <CardHeader>
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Folder className="size-5 group-hover:hidden" aria-hidden="true" />
                        <FolderOpen className="hidden size-5 group-hover:block" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 pr-8">
                        <CardTitle className="line-clamp-1">
                            <Link
                                to="/projects/$projectId"
                                params={{ projectId: p.id }}
                                className="after:absolute after:inset-0 after:content-['']"
                            >
                                {p.title}
                            </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                            {p.description ?? 'No design context yet'}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}