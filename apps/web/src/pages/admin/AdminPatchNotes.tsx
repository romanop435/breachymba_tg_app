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
  markdown: z.string().min(2),
  refType: z.string().min(2),
  refId: z.string().min(1)
});

type FormValues = z.infer<typeof schema>;

export default function AdminPatchNotes() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const listQuery = useQuery({
    queryKey: ['admin-patchnotes'],
    queryFn: () => apiFetch<any[]>('/admin/patchnotes')
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiFetch('/admin/patchnotes', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-patchnotes'] })
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: FormValues }) =>
      apiFetch(`/admin/patchnotes/${payload.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload.data)
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-patchnotes'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/patchnotes/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-patchnotes'] })
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', markdown: '', refType: 'WORKSHOP_UPDATE', refId: '' }
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
  if (listQuery.isError) return <BreachErrorState title="Patch notes offline" />;

  return (
    <AdminGuard>
      <div className="space-y-4">
        <BreachCard className="space-y-3">
          <div className="text-lg font-semibold">Create patch note</div>
          <form className="space-y-2" onSubmit={submitCreate}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title" {...form.register('title')} />
            <textarea className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" rows={4} placeholder="Markdown" {...form.register('markdown')} />
            <select className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" {...form.register('refType')}>
              <option value="WORKSHOP_UPDATE">WORKSHOP_UPDATE</option>
              <option value="COLLECTION_UPDATE">COLLECTION_UPDATE</option>
              <option value="SERVER">SERVER</option>
              <option value="NEWS_POST">NEWS_POST</option>
            </select>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Ref ID" {...form.register('refId')} />
            <BreachButton type="submit" loading={createMutation.isPending}>Publish</BreachButton>
          </form>
        </BreachCard>

        <div className="space-y-2">
          {listQuery.data?.map((note) => (
            <BreachCard key={note.id} className="space-y-2">
              <div className="text-sm font-semibold">{note.title}</div>
              <div className="text-xs text-text1">{note.refType} / {note.refId}</div>
              <div className="flex gap-2">
                <BreachButton variant="ghost" onClick={() => { setEditing(note); editForm.reset({ title: note.title, markdown: note.markdown, refType: note.refType, refId: note.refId }); }}>Edit</BreachButton>
                <BreachButton variant="danger" onClick={() => deleteMutation.mutate(note.id)}>Delete</BreachButton>
              </div>
            </BreachCard>
          ))}
        </div>

        <BreachModal open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }} title="Edit patch note">
          <form className="space-y-2" onSubmit={submitEdit}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title" {...editForm.register('title')} />
            <textarea className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" rows={4} placeholder="Markdown" {...editForm.register('markdown')} />
            <select className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" {...editForm.register('refType')}>
              <option value="WORKSHOP_UPDATE">WORKSHOP_UPDATE</option>
              <option value="COLLECTION_UPDATE">COLLECTION_UPDATE</option>
              <option value="SERVER">SERVER</option>
              <option value="NEWS_POST">NEWS_POST</option>
            </select>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Ref ID" {...editForm.register('refId')} />
            <BreachButton type="submit" loading={updateMutation.isPending}>Save</BreachButton>
          </form>
        </BreachModal>
      </div>
    </AdminGuard>
  );
}
