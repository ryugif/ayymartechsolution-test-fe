import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { meQueryOptions, safeRedirect } from '@/lib/auth';

export const Route = createFileRoute('/login')({
    validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
        redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    }),
    beforeLoad: async ({ context, search }) => {
        try {
            await context.queryClient.ensureQueryData(meQueryOptions);
        } catch {
            return; // not logged in, show the form
        }
        throw redirect({ to: safeRedirect(search.redirect) ?? '/projects' });
    },
    component: LoginPage,
});

function LoginPage() {
    const { redirect: target } = Route.useSearch();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const login = useMutation({
        mutationFn: authApi.login,
        onSuccess: (user) => {
            queryClient.setQueryData(meQueryOptions.queryKey, user);
            router.history.push(safeRedirect(target) ?? '/projects');
        },
    });

    const error = login.error instanceof ApiError ? login.error : undefined;
    const fieldError = (name: string) => error?.errors?.[name]?.[0];

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Log in</CardTitle>
                    <CardDescription>Sign in to your design projects.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="space-y-4"
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            login.mutate({ email, password });
                        }}
                    >
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                aria-invalid={!!fieldError('email')}
                                placeholder="Enter your email"
                            />
                            {fieldError('email') && <p className="text-sm text-destructive">{fieldError('email')}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-invalid={!!fieldError('password')}
                                placeholder="Enter your password"
                            />
                            {fieldError('password') && <p className="text-sm text-destructive">{fieldError('password')}</p>}
                        </div>

                        {error && error.code !== 'VALIDATION_ERROR' && (
                            <p role="alert" className="text-sm text-destructive">
                                {error.message}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={login.isPending}>
                            {login.isPending ? 'Logging in...' : 'Log in'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}