const TOKEN_KEY = "token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void =>
  localStorage.setItem(TOKEN_KEY, token);

export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

/**
 * Reads the `exp` claim without verifying the signature — enough to avoid
 * rendering a protected page with a token the server will reject anyway.
 * The server remains the only authority on validity.
 */
export const isTokenValid = (token: string | null = getToken()): boolean => {
  if (!token) return false;

  try {
    const payload = token.split(".")[1];
    if (!payload) return false;

    const { exp } = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };

    return typeof exp === "number" && exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
