import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../../lib/api';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { BreachCard } from '../../components/ui/BreachCard';
import { BreachButton } from '../../components/ui/BreachButton';
import { BreachModal } from '../../components/ui/BreachModal';
import { BreachSkeleton } from '../../components/ui/BreachSkeleton';
import { BreachErrorState } from '../../components/ui/BreachStates';

const schema = z.object({
  title: z.string().min(2),
  summary: z.string().min(2),
  body: z.string().min(2),
  tags: z.string().optional(),
  publishedAt: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function AdminNews() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const listQuery = useQuery({
    queryKey: ['admin-news'],
    queryFn: () => apiFetch<any[]>('/admin/news')
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiFetch('/admin/news', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          publishedAt: data.publishedAt || null
        })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] })
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: FormValues }) =>
      apiFetch(`/admin/news/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...payload.data,
          tags: payload.data.tags ? payload.data.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
          publishedAt: payload.data.publishedAt || null
        })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/news/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] })
  });

  const pinMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/news/${id}/pin`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] })
  });

  const hideMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/news/${id}/hide`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-news'] })
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', summary: '', body: '', tags: '', publishedAt: '' }
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const submitCreate = form.handleSubmit((data) => createMutation.mutate(data));
  const submitEdit = editForm.handleSubmit((data) => {
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, data });
    setEditing(null);
  });

  if (listQuery.isLoading) return <BreachSkeleton className="h-24" />;
  if (listQuery.isError) return <BreachErrorState title="News offline" />;

  return (
    <AdminGuard>
      <div className="space-y-4">
        <BreachCard className="space-y-3">
          <div className="text-lg font-semibold">Create news</div>
          <form className="space-y-2" onSubmit={submitCreate}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title" {...form.register('title')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Summary" {...form.register('summary')} />
            <textarea className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" rows={4} placeholder="Body" {...form.register('body')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Tags (comma)" {...form.register('tags')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="PublishedAt (ISO, blank = draft)" {...form.register('publishedAt')} />
            <BreachButton type="submit" loading={createMutation.isPending}>Publish</BreachButton>
          </form>
        </BreachCard>

        <div className="space-y-2">
          {listQuery.data?.map((post) => (
            <BreachCard key={post.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{post.title}</div>
                <div className="text-xs text-text1">{post.type}</div>
              </div>
              <div className="text-xs text-text1">{post.summary}</div>
              <div className="flex flex-wrap gap-2">
                <BreachButton variant="ghost" onClick={() => { setEditing(post); editForm.reset({ title: post.title, summary: post.summary, body: post.body, tags: post.tags?.join(', '), publishedAt: post.publishedAt || '' }); }}>Edit</BreachButton>
                <BreachButton variant="subtle" onClick={() => pinMutation.mutate(post.id)}>Pin</BreachButton>
                <BreachButton variant="subtle" onClick={() => hideMutation.mutate(post.id)}>Hide</BreachButton>
                <BreachButton variant="danger" onClick={() => deleteMutation.mutate(post.id)}>Delete</BreachButton>
              </div>
            </BreachCard>
          ))}
        </div>

        <BreachModal open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }} title="Edit news">
          <form className="space-y-2" onSubmit={submitEdit}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title" {...editForm.register('title')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Summary" {...editForm.register('summary')} />
            <textarea className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" rows={4} placeholder="Body" {...editForm.register('body')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Tags (comma)" {...editForm.register('tags')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="PublishedAt (ISO)" {...editForm.register('publishedAt')} />
            <BreachButton type="submit" loading={updateMutation.isPending}>Save</BreachButton>
          </form>
        </BreachModal>
      </div>
    </AdminGuard>
  );
}
