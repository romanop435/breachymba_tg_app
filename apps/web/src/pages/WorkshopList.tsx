import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState, BreachEmptyState } from '../components/ui/BreachStates';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';

export default function WorkshopList() {
  const query = useQuery({
    queryKey: ['workshop'],
    queryFn: () => apiFetch<any[]>('/workshop')
  });

  if (query.isLoading) return <BreachSkeleton className="h-28" />;
  if (query.isError) return <BreachErrorState title="Workshop offline" />;
  if (!query.data?.length) return <BreachEmptyState title="No workshop items" />;

  return (
    <div className="space-y-3">
      {query.data.map((item) => (
        <Link key={item.id} to={`/workshop/${item.id}`}>
          <BreachCard className="space-y-2">
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="text-xs text-text1">Updated: {formatDate(item.lastUpdateAt)}</div>
            <div className="text-xs text-text1">File ID: {item.workshopFileId}</div>
          </BreachCard>
        </Link>
      ))}
    </div>
  );
}
