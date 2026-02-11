import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState, BreachEmptyState } from '../components/ui/BreachStates';
import { Link } from 'react-router-dom';
import { formatDate } from '../lib/format';

export default function CollectionsList() {
  const query = useQuery({
    queryKey: ['collections'],
    queryFn: () => apiFetch<any[]>('/collections')
  });

  if (query.isLoading) return <BreachSkeleton className="h-28" />;
  if (query.isError) return <BreachErrorState title="Collections offline" />;
  if (!query.data?.length) return <BreachEmptyState title="No collections" />;

  return (
    <div className="space-y-3">
      {query.data.map((item) => (
        <Link key={item.id} to={`/collections/${item.id}`}>
          <BreachCard className="space-y-2">
            <div className="text-lg font-semibold">{item.title}</div>
            <div className="text-xs text-text1">Updated: {formatDate(item.lastChangeAt)}</div>
            <div className="text-xs text-text1">Collection ID: {item.collectionId}</div>
          </BreachCard>
        </Link>
      ))}
    </div>
  );
}
