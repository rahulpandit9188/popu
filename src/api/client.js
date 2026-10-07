import { readSession, saveRefreshedTokens } from './sessionStorage.js';

const API_BASE_URL = (
  import.meta.env?.VITE_API_BASE_URL || ''
).replace(/\/$/, '');

export function resolveApiUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

let refreshInFlight = null;

function tokenExpiresSoon(token, bufferSeconds = 30) {
  try {
    const payloadPart = token?.split('.')[1];
    if (!payloadPart) return false;
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const payload = JSON.parse(atob(normalized));
    return Number.isFinite(payload.exp)
      && (payload.exp * 1000) <= Date.now() + (bufferSeconds * 1000);
  } catch {
    return false;
  }
}

async function refreshAccessToken() {
  const refresh = readSession()?.refresh;
  if (!refresh) throw new Error('Session expired. Please login again to save your changes.');
  if (refreshInFlight?.refresh === refresh) return refreshInFlight.promise;

  const pending = { refresh };
  pending.promise = (async () => {
    const response = await fetch(`${API_BASE_URL}/authentication/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    const tokens = await response.json().catch(() => ({}));
    if (response.status === 400 || response.status === 401) {
      throw new Error('Session expired. Please login again to save your changes.');
    }
    if (!response.ok || !tokens.access) {
      throw new Error('Unable to renew session. Please try again.');
    }
    saveRefreshedTokens(refresh, tokens);
    return tokens.access;
  })();
  refreshInFlight = pending;
  try {
    return await pending.promise;
  } finally {
    if (refreshInFlight === pending) refreshInFlight = null;
  }
}

/** Root HTTP flow — auth / subjects / chapters / notes all call this. */
export async function request(path, options = {}, retried = false) {
  const { body, token, ...fetchOptions } = options;
  let access = token ? readSession()?.access || token : null;
  if (token && access && tokenExpiresSoon(access)) {
    access = await refreshAccessToken();
  }
  const headers = {
    Accept: 'application/json',
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(access ? { Authorization: `Bearer ${access}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));
  if (response.status === 401 && token && payload.code === 'token_not_valid') {
    if (retried) throw new Error('Session expired. Please login again to save your changes.');
    const latest = readSession()?.access;
    const renewed = latest && latest !== access ? latest : await refreshAccessToken();
    return request(path, { ...options, token: renewed }, true);
  }
  if (!response.ok) {
    const fieldError = Object.values(payload).find(Array.isArray)?.[0];
    throw new Error(payload.detail || payload.message || fieldError || 'Request failed');
  }

  return payload;
}

export function queryString(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const value = query.toString();
  return value ? `?${value}` : '';
}
