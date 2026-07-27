/**
 * The session lives in an httpOnly cookie the browser attaches automatically,
 * so nothing here holds a credential — only when the server said the session
 * lapses, which is enough to decide what to render. The server stays the sole
 * authority on whether a request is authorised.
 */

const EXPIRY_KEY = "sessionExpiresAt";

export const setSessionExpiry = (expiresAt: string): void =>
  localStorage.setItem(EXPIRY_KEY, expiresAt);

export const clearSession = (): void => localStorage.removeItem(EXPIRY_KEY);

export const hasLiveSession = (): boolean => {
  const expiresAt = localStorage.getItem(EXPIRY_KEY);
  if (!expiresAt) return false;

  const at = Date.parse(expiresAt);
  return !isNaN(at) && at > Date.now();
};
