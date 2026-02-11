import { cn } from '../../lib/cn';

export function BreachSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-bg2 via-muted/40 to-bg2',
        className
      )}
    />
  );
}
