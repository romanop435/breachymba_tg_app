import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { BreachTabs } from '../components/ui/BreachTabs';
import { BreachButton } from '../components/ui/BreachButton';
import { NewsCard } from '../components/NewsCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachEmptyState, BreachErrorState } from '../components/ui/BreachStates';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'manual', label: 'Manual' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'collections', label: 'Collections' },
  { value: 'servers', label: 'Servers' }
];

type FeedResponse = {
  pinned: any[];
  items: any[];
  page: number;
  limit: number;
  total: number;
};

export default function HomeFeed() {
  const [filter, setFilter] = useState('all');

  const query = useInfiniteQuery<FeedResponse>({
    queryKey: ['feed', filter],
    queryFn: ({ pageParam = 1 }) =>
      apiFetch<FeedResponse>(`/feed?filter=${filter}&page=${pageParam}&limit=8`),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage;
      const maxPage = Math.ceil(total / limit);
      return page < maxPage ? page + 1 : undefined;
    }
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) || [], [query.data]);
  const pinned = query.data?.pages?.[0]?.pinned || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] uppercase tracking-[0.2em] text-text1">Containment feed</div>
          <div className="text-xl font-semibold">Latest intel</div>
        </div>
        <BreachTabs options={filters} value={filter} onChange={setFilter} />
      </div>

      {query.isLoading ? (
        <div className="space-y-3">
          <BreachSkeleton className="h-28" />
          <BreachSkeleton className="h-28" />
          <BreachSkeleton className="h-28" />
        </div>
      ) : query.isError ? (
        <BreachErrorState title="Feed offline" description="Unable to load posts." onRetry={() => query.refetch()} />
      ) : pinned.length === 0 && items.length === 0 ? (
        <BreachEmptyState title="No posts yet" description="Manual or auto posts will appear here." />
      ) : (
        <div className="space-y-4">
          {pinned.length ? (
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-[0.3em] text-text1">Pinned</div>
              {pinned.map((post: any) => (
                <NewsCard key={post.id} post={post} />
              ))}
            </div>
          ) : null}

          <div className="space-y-3">
            {items.map((post: any) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            {query.hasNextPage ? (
              <BreachButton variant="subtle" onClick={() => query.fetchNextPage()} loading={query.isFetchingNextPage}>
                Load more
              </BreachButton>
            ) : (
              <div className="text-xs text-text1">End of feed</div>
            )}
            <BreachButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Top
            </BreachButton>
          </div>
        </div>
      )}
    </div>
  );
}
