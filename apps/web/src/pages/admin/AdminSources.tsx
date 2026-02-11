import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '../../lib/api';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { BreachCard } from '../../components/ui/BreachCard';
import { BreachButton } from '../../components/ui/BreachButton';
import { BreachSkeleton } from '../../components/ui/BreachSkeleton';
import { BreachErrorState } from '../../components/ui/BreachStates';

const workshopSchema = z.object({
  workshopFileId: z.string().min(3),
  title: z.string().optional()
});
const collectionSchema = z.object({
  collectionId: z.string().min(3),
  title: z.string().optional()
});

type WorkshopForm = z.infer<typeof workshopSchema>;

type CollectionForm = z.infer<typeof collectionSchema>;

export default function AdminSources() {
  const queryClient = useQueryClient();
  const workshopQuery = useQuery({
    queryKey: ['workshop'],
    queryFn: () => apiFetch<any[]>('/workshop')
  });
  const collectionsQuery = useQuery({
    queryKey: ['collections'],
    queryFn: () => apiFetch<any[]>('/collections')
  });

  const workshopForm = useForm<WorkshopForm>({
    resolver: zodResolver(workshopSchema),
    defaultValues: { workshopFileId: '', title: '' }
  });
  const collectionForm = useForm<CollectionForm>({
    resolver: zodResolver(collectionSchema),
    defaultValues: { collectionId: '', title: '' }
  });

  const addWorkshop = useMutation({
    mutationFn: (data: WorkshopForm) => apiFetch('/admin/sources/workshop', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workshop'] })
  });
  const removeWorkshop = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/sources/workshop/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workshop'] })
  });

  const addCollection = useMutation({
    mutationFn: (data: CollectionForm) => apiFetch('/admin/sources/collections', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] })
  });
  const removeCollection = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/sources/collections/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] })
  });

  const submitWorkshop = workshopForm.handleSubmit((data) => addWorkshop.mutate(data));
  const submitCollection = collectionForm.handleSubmit((data) => addCollection.mutate(data));

  return (
    <AdminGuard>
      <div className="space-y-4">
        <BreachCard className="space-y-3">
          <div className="text-lg font-semibold">Workshop sources</div>
          <form className="space-y-2" onSubmit={submitWorkshop}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Workshop File ID" {...workshopForm.register('workshopFileId')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title (optional)" {...workshopForm.register('title')} />
            <BreachButton type="submit" loading={addWorkshop.isPending}>Add</BreachButton>
          </form>
          {workshopQuery.isLoading ? (
            <BreachSkeleton className="h-16" />
          ) : workshopQuery.isError ? (
            <BreachErrorState title="Workshop list offline" />
          ) : (
            <div className="space-y-2">
              {workshopQuery.data?.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-stroke bg-bg2 px-3 py-2 text-xs">
                  <div>{item.title}</div>
                  <BreachButton variant="danger" onClick={() => removeWorkshop.mutate(item.id)}>Remove</BreachButton>
                </div>
              ))}
            </div>
          )}
        </BreachCard>

        <BreachCard className="space-y-3">
          <div className="text-lg font-semibold">Collection sources</div>
          <form className="space-y-2" onSubmit={submitCollection}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Collection ID" {...collectionForm.register('collectionId')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title (optional)" {...collectionForm.register('title')} />
            <BreachButton type="submit" loading={addCollection.isPending}>Add</BreachButton>
          </form>
          {collectionsQuery.isLoading ? (
            <BreachSkeleton className="h-16" />
          ) : collectionsQuery.isError ? (
            <BreachErrorState title="Collections list offline" />
          ) : (
            <div className="space-y-2">
              {collectionsQuery.data?.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-stroke bg-bg2 px-3 py-2 text-xs">
                  <div>{item.title}</div>
                  <BreachButton variant="danger" onClick={() => removeCollection.mutate(item.id)}>Remove</BreachButton>
                </div>
              ))}
            </div>
          )}
        </BreachCard>
      </div>
    </AdminGuard>
  );
}
