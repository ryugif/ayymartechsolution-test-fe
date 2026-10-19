import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { leaveChat } from '@/features/chat/send-message';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { useChatStreamStore } from '@/stores/chat-stream';

/** Log out button that asks for confirmation first. */
export function LogoutDialog() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const streaming = useChatStreamStore((s) => s.status === 'streaming');

    const logout = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            leaveChat(); // cancel a running answer and drop chat state
            queryClient.clear(); // else /login sees the cached user and bounces back
            setOpen(false);
            void navigate({ to: '/login' });
        },
        onError: (error) => {
            toast.error(error instanceof ApiError ? error.message : 'Could not log out, please try again');
        },
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger>
                <Button variant="outline" size="sm">
                    <LogOutIcon />
                    Log out
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will need to sign in again to see your projects.
                        {streaming && ' The answer that is being written will be cancelled and not saved.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={logout.isPending}>Stay logged in</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={logout.isPending}
                        onClick={(e) => {
                            e.preventDefault(); // stay open until the request ends
                            logout.mutate();
                        }}
                    >
                        {logout.isPending ? 'Logging out...' : 'Log out'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}