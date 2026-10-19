import type { ReactNode } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    pendingLabel: string;
    isPending: boolean;
    /** Red confirm button, for actions that cannot be undone. */
    destructive?: boolean;
    onConfirm: () => void;
};

/** Confirm dialog that stays open while the request runs, so errors do not lose it. */
export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel,
    pendingLabel,
    isPending,
    destructive,
    onConfirm,
}: Props) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(next) => {
                if (!isPending) onOpenChange(next); // no Escape or outside click mid-request
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className={cn(destructive && buttonVariants({ variant: 'destructive' }))}
                        disabled={isPending}
                        onClick={(e) => {
                            e.preventDefault(); // Radix would close the dialog right away
                            onConfirm();
                        }}
                    >
                        {isPending ? pendingLabel : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}