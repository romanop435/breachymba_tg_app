export type TelegramThemeParams = Record<string, string | undefined>;

declare global {
  interface Window {
    Telegram?: any;
  }
}

export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export function initTelegram() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  applyTelegramTheme();
  if (tg.onEvent) {
    tg.onEvent('themeChanged', applyTelegramTheme);
  }
}

export function applyTelegramTheme() {
  if (!tg) return;
  const theme = tg.themeParams as TelegramThemeParams;
  if (!theme) return;

  const root = document.documentElement;
  const bg = theme.bg_color || '#0b0d10';
  const secondary = theme.secondary_bg_color || '#10141a';
  const text = theme.text_color || '#e6eaf0';
  const hint = theme.hint_color || '#a9b1bc';

  root.style.setProperty('--bg-0', bg);
  root.style.setProperty('--bg-1', secondary);
  root.style.setProperty('--bg-2', secondary);
  root.style.setProperty('--text-0', text);
  root.style.setProperty('--text-1', hint);

  const isLight = isLightColor(bg);
  root.classList.toggle('tg-light', isLight);
}

function isLightColor(hex: string) {
  const rgb = hex.replace('#', '');
  if (rgb.length !== 6) return false;
  const r = parseInt(rgb.substring(0, 2), 16);
  const g = parseInt(rgb.substring(2, 4), 16);
  const b = parseInt(rgb.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140;
}
