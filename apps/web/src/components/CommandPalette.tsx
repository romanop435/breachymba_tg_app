import { Command } from 'cmdk';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['command-palette-data'],
    queryFn: async () => {
      const [feed, workshop, collections, servers] = await Promise.all([
        apiFetch<any>('/feed?filter=all&page=1&limit=30'),
        apiFetch<any[]>('/workshop'),
        apiFetch<any[]>('/collections'),
        apiFetch<any[]>('/servers')
      ]);
      return { feed, workshop, collections, servers };
    },
    enabled: open
  });

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const items = [
    ...(data?.feed?.items || []),
    ...(data?.feed?.pinned || [])
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div className="mx-auto mt-16 w-[90vw] max-w-lg rounded-xl border border-stroke bg-bg1 p-3 shadow-lift">
        <Command className="w-full" onClick={(event) => event.stopPropagation()}>
          <Command.Input
            placeholder="Search news, addons, collections, servers..."
            className="w-full rounded-lg border border-stroke bg-bg2 px-3 py-2 text-sm text-text0 outline-none"
          />
          <Command.List className="mt-3 max-h-80 overflow-auto">
            <Command.Empty className="px-2 py-3 text-sm text-text1">No results.</Command.Empty>

            <Command.Group heading="News">
              {items.map((item: any) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    navigate(`/news/${item.id}`);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-bg2"
                >
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Workshop">
              {data?.workshop?.map((item: any) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    navigate(`/workshop/${item.id}`);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-bg2"
                >
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Collections">
              {data?.collections?.map((item: any) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    navigate(`/collections/${item.id}`);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-bg2"
                >
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Servers">
              {data?.servers?.map((item: any) => (
                <Command.Item
                  key={item.id}
                  onSelect={() => {
                    navigate(`/servers/${item.id}`);
                    onOpenChange(false);
                  }}
                  className="cursor-pointer rounded-lg px-2 py-2 text-sm hover:bg-bg2"
                >
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
