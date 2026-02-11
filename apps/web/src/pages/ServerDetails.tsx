import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState } from '../components/ui/BreachStates';
import { StatusDot } from '../components/ui/StatusDot';
import { DataRow } from '../components/ui/DataRow';
import { BreachButton } from '../components/ui/BreachButton';

export default function ServerDetails() {
  const { id } = useParams();
  const serverQuery = useQuery({
    queryKey: ['server', id],
    queryFn: () => apiFetch<any>(`/servers/${id}`),
    enabled: !!id
  });
  const historyQuery = useQuery({
    queryKey: ['server-history', id],
    queryFn: () => apiFetch<any[]>(`/servers/${id}/history`),
    enabled: !!id
  });

  if (serverQuery.isLoading) return <BreachSkeleton className="h-28" />;
  if (serverQuery.isError) return <BreachErrorState title="Server offline" />;

  const server = serverQuery.data;
  const snap = server.latestSnapshot;

  const history = (historyQuery.data || []).slice(0, 20).reverse();
  const maxPlayers = Math.max(...history.map((h) => h.maxPlayers || 0), 1);

  return (
    <div className="space-y-4">
      <BreachCard className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">{server.title}</div>
          <StatusDot status={snap?.isOnline ? 'online' : 'offline'} />
        </div>
        <DataRow label="Address" value={`${server.ip}:${server.port}`} />
        <DataRow label="Players" value={snap?.isOnline ? `${snap.players}/${snap.maxPlayers}` : 'Offline'} />
        <DataRow label="Map" value={snap?.map || '-'} />
        <DataRow label="Ping" value={snap?.ping ? `${snap.ping}ms` : '-'} />
        <BreachButton
          variant="subtle"
          onClick={() => navigator.clipboard.writeText(`connect ${server.ip}:${server.port}`)}
        >
          Copy connect string
        </BreachButton>
      </BreachCard>

      <BreachCard className="space-y-2">
        <div className="text-sm font-semibold">Recent activity</div>
        <div className="flex h-16 items-end gap-1">
          {history.map((point, index) => {
            const height = Math.max(6, (point.players / maxPlayers) * 60);
            return (
              <div
                key={`${point.id}-${index}`}
                className="w-full rounded-sm bg-acc0/60"
                style={{ height: `${height}px` }}
                title={`${point.players}/${point.maxPlayers}`}
              />
            );
          })}
        </div>
      </BreachCard>
    </div>
  );
}
