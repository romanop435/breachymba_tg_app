import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState } from '../components/ui/BreachStates';
import { formatDate } from '../lib/format';

export default function WorkshopDetails() {
  const { id } = useParams();
  const itemQuery = useQuery({
    queryKey: ['workshop', id],
    queryFn: () => apiFetch<any>(`/workshop/${id}`),
    enabled: !!id
  });
  const updatesQuery = useQuery({
    queryKey: ['workshop-updates', id],
    queryFn: () => apiFetch<any[]>(`/workshop/${id}/updates`),
    enabled: !!id
  });

  if (itemQuery.isLoading) return <BreachSkeleton className="h-28" />;
  if (itemQuery.isError) return <BreachErrorState title="Workshop offline" />;

  const item = itemQuery.data;

  return (
    <div className="space-y-4">
      <BreachCard className="space-y-2">
        <div className="text-xl font-semibold">{item.title}</div>
        <div className="text-xs text-text1">File ID: {item.workshopFileId}</div>
        <div className="text-xs text-text1">Last update: {formatDate(item.lastUpdateAt)}</div>
      </BreachCard>

      <div className="text-sm font-semibold">Timeline</div>
      {updatesQuery.isLoading ? (
        <BreachSkeleton className="h-24" />
      ) : updatesQuery.isError ? (
        <BreachErrorState title="Updates offline" />
      ) : updatesQuery.data?.length ? (
        <div className="space-y-2">
          {updatesQuery.data.map((update) => (
            <BreachCard key={update.id} className="space-y-2">
              <div className="text-xs text-text1">Detected: {formatDate(update.detectedAt)}</div>
              <div className="text-sm text-text1">
                {update.changeJson?.next?.title ? `Title: ${update.changeJson.next.title}` : 'Update detected'}
              </div>
            </BreachCard>
          ))}
        </div>
      ) : (
        <div className="text-xs text-text1">No updates yet.</div>
      )}
    </div>
  );
}
