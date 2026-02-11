import { cn } from '../../lib/cn';

export function StatusDot({ status }: { status: 'online' | 'offline' | 'warn' }) {
  return (
    <span
      className={cn(
        'inline-flex h-2.5 w-2.5 rounded-full',
        status === 'online' && 'bg-ok',
        status === 'offline' && 'bg-danger',
        status === 'warn' && 'bg-warn'
      )}
    />
  );
}
