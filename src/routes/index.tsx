import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">CMF Design Assistant</h1>
      <Button className="mt-4">Test</Button>
    </div>
  );
}