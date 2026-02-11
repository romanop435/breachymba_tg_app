import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/api';
import { BreachSkeleton } from '../ui/BreachSkeleton';
import { BreachErrorState } from '../ui/BreachStates';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<any>('/me'),
    retry: false
  });

  if (meQuery.isLoading) return <BreachSkeleton className="h-24" />;
  if (meQuery.isError) return <BreachErrorState title="Admin only" description="Verify Telegram first." />;
  if (!meQuery.data?.isAdmin) return <BreachErrorState title="Access denied" description="Admin allowlist required." />;

  return <>{children}</>;
}
