/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg0: 'var(--bg-0)',
        bg1: 'var(--bg-1)',
        bg2: 'var(--bg-2)',
        text0: 'var(--text-0)',
        text1: 'var(--text-1)',
        muted: 'var(--muted)',
        stroke: 'var(--stroke)',
        shadow: 'var(--shadow)',
        acc0: 'var(--acc-0)',
        acc1: 'var(--acc-1)',
        acc2: 'var(--acc-2)',
        ok: 'var(--ok)',
        warn: 'var(--warn)',
        danger: 'var(--danger)'
      },
      boxShadow: {
        soft: '0 8px 24px rgba(0,0,0,0.35)',
        lift: '0 14px 30px rgba(0,0,0,0.45)'
      },
      borderRadius: {
        xl: '14px'
      }
    }
  },
  plugins: []
};
