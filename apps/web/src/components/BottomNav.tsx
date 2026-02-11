import { NavLink } from 'react-router-dom';
import { cn } from '../lib/cn';

const navItems = [
  { to: '/', label: 'Feed' },
  { to: '/workshop', label: 'Workshop' },
  { to: '/collections', label: 'Collections' },
  { to: '/servers', label: 'Servers' },
  { to: '/profile', label: 'Profile' }
];

export function BottomNav() {
  return (
    <div
      className="fixed bottom-4 left-1/2 z-40 w-[92vw] max-w-md -translate-x-1/2 rounded-2xl border border-stroke bg-bg1/95 px-3 py-2 shadow-lift backdrop-blur"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'rounded-xl px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition-all',
                isActive ? 'bg-acc0 text-bg0 shadow-soft' : 'text-text1 hover:text-text0'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
