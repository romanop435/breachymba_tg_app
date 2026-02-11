import { cn } from '../../lib/cn';

export function BreachChip({ label, tone = 'default' }: { label: string; tone?: 'default' | 'auto' | 'accent' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        tone === 'default' && 'border-stroke text-text1 bg-bg2',
        tone === 'auto' && 'border-acc0/40 text-acc0 bg-acc2',
        tone === 'accent' && 'border-acc0 text-acc0 bg-transparent'
      )}
    >
      {label}
    </span>
  );
}
