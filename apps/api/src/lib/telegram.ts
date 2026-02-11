import crypto from 'crypto';

export function verifyTelegramInitData(initData: string, botToken: string) {
  if (!initData || !botToken) return { ok: false, data: null };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, data: null };

  const pairs: string[] = [];
  params.forEach((value, key) => {
    if (key === 'hash') return;
    pairs.push(`${key}=${value}`);
  });
  pairs.sort();
  const dataCheckString = pairs.join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const computedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return { ok: false, data: null };

  const authDate = params.get('auth_date');
  if (authDate) {
    const authDateNum = Number(authDate) * 1000;
    const now = Date.now();
    const maxAge = 1000 * 60 * 60 * 24; // 24h
    if (now - authDateNum > maxAge) return { ok: false, data: null };
  }

  const userRaw = params.get('user');
  let user = null as null | {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return { ok: true, data: { user, params } };
}
