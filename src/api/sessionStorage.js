export const SESSION_KEY = 'studynotes-user';

export function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveRefreshedTokens(refresh, tokens) {
  const session = readSession();
  // A response from an earlier login must not restore a logged-out session.
  if (!session || session.refresh !== refresh) {
    throw new Error('Session changed. Please login again.');
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    ...session,
    access: tokens.access,
    refresh: tokens.refresh || refresh,
  }));
  window.dispatchEvent(new Event('session-updated'));
}
