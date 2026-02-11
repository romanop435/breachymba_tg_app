const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let cachedToken: string | null = null;

export function getToken() {
  if (cachedToken) return cachedToken;
  cachedToken = localStorage.getItem('bb_token');
  return cachedToken;
}

export function setToken(token: string | null) {
  cachedToken = token;
  if (token) localStorage.setItem('bb_token', token);
  else localStorage.removeItem('bb_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Request failed');
  }

  return res.json();
}

export function getApiUrl() {
  return API_URL;
}
