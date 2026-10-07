import { AuthUser } from '@/types/auth';

const TOKEN_KEY = 'delivery_agent_token';
const USER_KEY = 'delivery_agent_user';
const AUTH_SESSION_CHANGED_EVENT = 'delivery-agent-auth-session-changed';

export const subscribeToAuthSession = (listener: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
};

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const saveAuthSession = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};
