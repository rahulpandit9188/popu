import { authApi } from './api';
import { readSession, SESSION_KEY } from './api/sessionStorage.js';
export { readSession } from './api/sessionStorage.js';

const PROFILES_KEY = 'studynotes-profiles';

function readProfiles() {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}');
  } catch {
    return {};
  }
}

export function readProfile(email) {
  return readProfiles()[email] || {};
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function logoutSession() {
  const session = readSession();
  try {
    if (session?.refresh) {
      await authApi.logout(session.refresh);
    }
  } finally {
    clearSession();
  }
}

export function updateStoredUser(session) {
  const profiles = readProfiles();
  const profile = { ...session };
  delete profile.access;
  delete profile.refresh;

  localStorage.setItem(
    PROFILES_KEY,
    JSON.stringify({ ...profiles, [session.email]: profile }),
  );
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}
