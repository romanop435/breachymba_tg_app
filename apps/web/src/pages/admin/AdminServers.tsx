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

const schema = z.object({
  title: z.string().min(2),
  ip: z.string().min(3),
  port: z.coerce.number().int(),
  tags: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isEnabled: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

export default function AdminServers() {
  const queryClient = useQueryClient();
  const listQuery = useQuery({
    queryKey: ['servers'],
    queryFn: () => apiFetch<any[]>('/admin/servers')
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', ip: '', port: 27015, tags: '', sortOrder: 0, isEnabled: true }
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiFetch('/admin/servers', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
          sortOrder: data.sortOrder || 0,
          isEnabled: data.isEnabled ?? true
        })
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servers'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/servers/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['servers'] })
  });

  const submit = form.handleSubmit((data) => createMutation.mutate(data));

  if (listQuery.isLoading) return <BreachSkeleton className="h-24" />;
  if (listQuery.isError) return <BreachErrorState title="Servers offline" />;

  return (
    <AdminGuard>
      <div className="space-y-4">
        <BreachCard className="space-y-3">
          <div className="text-lg font-semibold">Add server</div>
          <form className="space-y-2" onSubmit={submit}>
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Title" {...form.register('title')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="IP" {...form.register('ip')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Port" {...form.register('port')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Tags (comma)" {...form.register('tags')} />
            <input className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm" placeholder="Sort order" {...form.register('sortOrder')} />
            <label className="flex items-center gap-2 text-sm text-text1">
              <input type="checkbox" defaultChecked {...form.register('isEnabled')} />
              Enabled
            </label>
            <BreachButton type="submit" loading={createMutation.isPending}>Save</BreachButton>
          </form>
        </BreachCard>

        <div className="space-y-2">
          {listQuery.data?.map((server) => (
            <BreachCard key={server.id} className="space-y-1">
              <div className="text-sm font-semibold">{server.title}</div>
              <div className="text-xs text-text1">{server.ip}:{server.port}</div>
              <BreachButton variant="danger" onClick={() => deleteMutation.mutate(server.id)}>Remove</BreachButton>
            </BreachCard>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
