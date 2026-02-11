import { apiFetch, setToken, getToken } from './api';
import { tg } from './telegram';

export async function loginWithTelegram() {
  const initData = tg?.initData || '';
  if (!initData) throw new Error('Telegram initData missing');
  const result = await apiFetch<{ token: string; user: any; isAdmin: boolean }>(
    '/auth/telegram',
    {
      method: 'POST',
      body: JSON.stringify({ initData })
    }
  );
  setToken(result.token);
  return result;
}

export function isLoggedIn() {
  return !!getToken();
}
