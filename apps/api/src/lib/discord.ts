const DISCORD_API = 'https://discord.com/api';

export function buildDiscordAuthUrl(params: {
  clientId: string;
  redirectUri: string;
  state: string;
}) {
  const { clientId, redirectUri, state } = params;
  const url = new URL(`${DISCORD_API}/oauth2/authorize`);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify');
  url.searchParams.set('state', state);
  return url.toString();
}

export async function exchangeDiscordCode(params: {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  code: string;
}) {
  const body = new URLSearchParams();
  body.set('client_id', params.clientId);
  body.set('client_secret', params.clientSecret);
  body.set('grant_type', 'authorization_code');
  body.set('code', params.code);
  body.set('redirect_uri', params.redirectUri);

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) throw new Error(`Discord token error: ${res.status}`);
  return res.json();
}

export async function fetchDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error(`Discord user error: ${res.status}`);
  return res.json();
}
