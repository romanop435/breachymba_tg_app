import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { BreachCard } from '../components/ui/BreachCard';
import { BreachSkeleton } from '../components/ui/BreachSkeleton';
import { BreachErrorState } from '../components/ui/BreachStates';
import { formatDate } from '../lib/format';
import { BreachButton } from '../components/ui/BreachButton';
import { MarkdownViewer } from '../components/ui/MarkdownViewer';

export default function NewsDetails() {
  const { id } = useParams();
  const query = useQuery({
    queryKey: ['news', id],
    queryFn: () => apiFetch<any>(`/news/${id}`),
    enabled: !!id
  });

  if (query.isLoading) return <BreachSkeleton className="h-40" />;
  if (query.isError) return <BreachErrorState title="News offline" description="Unable to load post." />;

  const post = query.data;

  return (
    <div className="space-y-4">
      <BreachCard hazard={post.isPinned} className="space-y-3">
        <div>
          <div className="text-xl font-semibold">{post.title}</div>
          <div className="text-xs text-text1">{formatDate(post.publishedAt)}</div>
        </div>
        <div className="text-sm text-text1">{post.summary}</div>
        <div className="text-sm leading-6">{post.body}</div>
        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((tag: string) => (
            <span key={tag} className="rounded-full border border-stroke px-2 py-1 text-[11px] uppercase text-text1">
              {tag}
            </span>
          ))}
        </div>
      </BreachCard>

      {post.patchNotes?.length ? (
        <BreachCard className="space-y-3" hazard>
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Patch notes</div>
            <BreachButton variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back
            </BreachButton>
          </div>
          {post.patchNotes.map((note: any) => (
            <div key={note.id} className="rounded-xl border border-stroke bg-bg2 p-3">
              <div className="text-sm font-semibold">{note.title}</div>
              <MarkdownViewer markdown={note.markdown} />
            </div>
          ))}
        </BreachCard>
      ) : null}
    </div>
  );
}
