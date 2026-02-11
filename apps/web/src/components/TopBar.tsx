import { BreachButton } from './ui/BreachButton';

export function TopBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between border-b border-stroke bg-bg0/90 px-4 py-3 backdrop-blur"
      style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.2em] text-text1">BREACHYMBA</div>
        <div className="text-lg font-semibold">BLOG</div>
      </div>
      <BreachButton variant="ghost" onClick={onSearch}>
        Search
      </BreachButton>
    </div>
  );
}
