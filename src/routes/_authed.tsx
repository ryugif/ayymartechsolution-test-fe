import { ApiError } from '@/lib/api/errors';
import { meQueryOptions } from '@/lib/auth';
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { LogoutDialog } from '../features/auth/logout-dialog';

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.ensureQueryData(meQueryOptions);
      return { user };
    } catch (err) {
      if (err instanceof ApiError && err.code === 'AUTH_REQUIRED') {
        throw redirect({ to: '/login', search: { redirect: location.href } });
      }
      throw err;
    }
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-center border-b">
        <div className="flex items-center shrink-0 w-full justify-between max-w-5xl px-6 py-3">
          <Link to="/projects" className="font-semibold">
            CMF Design Assistant
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{user.email}</span>
            <LogoutDialog />
          </div>
        </div>
      </header>
      <main className="mx-auto min-h-0 w-full max-w-5xl flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>

    // <div className="min-h-screen">
    //   <header className="flex items-center justify-between border-b px-6 py-3">
    //     <Link to="/projects" className="font-semibold">
    //       CMF Design Assistant
    //     </Link>
    //     <div className="flex items-center gap-3 text-sm">
    //       <span className="text-muted-foreground">{user.email}</span>
    //       <Button variant="outline" size="sm" onClick={() => logout.mutate()} disabled={logout.isPending}>
    //         Log out
    //       </Button>
    //     </div>
    //   </header>
    //   <main className="mx-auto max-w-5xl p-6">
    //     <Outlet />
    //   </main>
    // </div>
  );
}