import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState, BreachEmptyState } from '../components/ui/BreachStates';
import { Link } from 'react-router-dom';
import { StatusDot } from '../components/ui/StatusDot';

export default function ServersList() {
  const query = useQuery({
    queryKey: ['servers'],
    queryFn: () => apiFetch<any[]>('/servers')
  });

  if (query.isLoading) return <BreachSkeleton className="h-28" />;
  if (query.isError) return <BreachErrorState title="Servers offline" />;
  if (!query.data?.length) return <BreachEmptyState title="No servers" />;

  return (
    <div className="space-y-3">
      {query.data.map((server) => {
        const snap = server.latestSnapshot;
        const status = snap?.isOnline ? 'online' : 'offline';
        return (
          <Link key={server.id} to={`/servers/${server.id}`}>
            <BreachCard className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{server.title}</div>
                <StatusDot status={status} />
              </div>
              <div className="text-xs text-text1">{server.ip}:{server.port}</div>
              <div className="text-xs text-text1">
                {snap?.isOnline ? `${snap.players}/${snap.maxPlayers} players` : 'Offline'}
              </div>
              <div className="text-xs text-text1">Map: {snap?.map || '-'}</div>
            </BreachCard>
          </Link>
        );
      })}
    </div>
  );
}
