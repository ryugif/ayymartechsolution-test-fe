import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/lib/api/errors';

export function ProjectsError({ error }: ErrorComponentProps) {
    const router = useRouter();
    return (
        <div className="space-y-3">
            <p role="alert" className="text-destructive">
                {error instanceof ApiError ? error.message : 'Could not load projects'}
            </p>
            <Button variant="outline" onClick={() => void router.invalidate()}>
                Try again
            </Button>
        </div>
    );
}