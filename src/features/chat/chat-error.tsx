import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/errors';

export function ChatError({ error }: ErrorComponentProps) {
    const router = useRouter();

    if (error instanceof ApiError && error.code === 'PROJECT_NOT_FOUND') {
        return (
            <div className="space-y-3 py-12 text-center">
                <h1 className="text-xl font-semibold">Project not found</h1>
                <p className="text-muted-foreground">It may have been deleted.</p>
                <Button variant="outline">
                    <Link to="/projects">Back to projects</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3 py-12 text-center">
            <p role="alert" className="text-destructive">
                {error instanceof ApiError ? error.message : 'Could not load this chat'}
            </p>
            <Button variant="outline" onClick={() => void router.invalidate()}>
                Try again
            </Button>
        </div>
    );
}