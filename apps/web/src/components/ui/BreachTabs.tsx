import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export type TabOption = { value: string; label: string };

export function BreachTabs({
  options,
  value,
  onChange
}: {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-xl border border-stroke bg-bg2 p-1">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative px-3 py-1.5 text-xs font-semibold transition-colors',
              active ? 'text-bg0' : 'text-text1'
            )}
          >
            {active ? (
              <motion.span
                layoutId="tab-slider"
                className="absolute inset-0 rounded-lg bg-acc0"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
