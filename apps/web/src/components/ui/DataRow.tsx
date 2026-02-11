import { cn } from '../../lib/cn';

export function DataRow({ label, value, className }: { label: string; value?: string | number | null; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between text-sm', className)}>
      <span className="text-text1">{label}</span>
      <span className="font-medium text-text0">{value ?? '-'}</span>
    </div>
  );
}
