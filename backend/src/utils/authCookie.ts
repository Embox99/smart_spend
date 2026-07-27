import type { CookieOptions, Response } from "express";
import { env } from "../config/env";

export const AUTH_COOKIE = "token";

/**
 * The session cookie is httpOnly so a cross-site script cannot read it, which
 * localStorage could not prevent. SameSite=lax blocks it from riding along on
 * cross-site requests; a client on another origin needs `sameSite: "none"`
 * with `secure`, which is what CROSS_SITE_COOKIES turns on.
 */
const cookieOptions = (): CookieOptions => {
  const crossSite = env.CROSS_SITE_COOKIES;

  return {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite || env.NODE_ENV === "production",
    path: "/",
    maxAge: env.SESSION_MAX_AGE_MS,
  };
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE, token, cookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  // maxAge must be omitted for the clear to match the original cookie.
  const { maxAge: _maxAge, ...options } = cookieOptions();
  res.clearCookie(AUTH_COOKIE, options);
};
