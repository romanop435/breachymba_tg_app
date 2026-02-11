import crypto from 'crypto';

type VerifyOk = {
  ok: true;
  data: {
    user: null | {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    params: URLSearchParams;
  };
};

type VerifyFail = {
  ok: false;
  reason:
    | 'missing_init_data'
    | 'missing_bot_token'
    | 'missing_hash'
    | 'hash_mismatch'
    | 'expired'
    | 'invalid_user_json';
};

export function verifyTelegramInitData(initData: string, botToken: string): VerifyOk | VerifyFail {
  if (!initData) return { ok: false, reason: 'missing_init_data' };
  if (!botToken) return { ok: false, reason: 'missing_bot_token' };
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return { ok: false, reason: 'missing_hash' };

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

  if (computedHash !== hash) return { ok: false, reason: 'hash_mismatch' };

  const authDate = params.get('auth_date');
  if (authDate) {
    const authDateNum = Number(authDate) * 1000;
    const now = Date.now();
    const maxAge = 1000 * 60 * 60 * 24; // 24h
    if (now - authDateNum > maxAge) return { ok: false, reason: 'expired' };
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
      return { ok: false, reason: 'invalid_user_json' };
    }
  }

  return { ok: true, data: { user, params } };
}
