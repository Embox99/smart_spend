import type { RequestHandler } from "express";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const allowAll: RequestHandler = (_req, _res, next) => next();

/**
 * Rejects state-changing requests that do not originate from an allowed site.
 *
 * With SameSite=Lax the browser already withholds the session cookie from
 * cross-site writes. That protection disappears under CROSS_SITE_COOKIES,
 * which a deployment needs when the API and the SPA sit on different sites —
 * so the origin is checked explicitly rather than left to the cookie policy.
 *
 * `enabled` is a parameter rather than a read of the config module so the
 * behaviour can be exercised both ways in a test.
 */
export const csrfGuard = (
  allowedOrigins: string[],
  enabled: boolean
): RequestHandler => {
  if (!enabled) return allowAll;

  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();

    // Bearer clients are not browser-driven, and a third-party page cannot
    // attach a header to a cross-site request.
    if (req.headers.authorization) return next();

    const origin = req.get("origin");

    // Non-browser clients send no Origin. Browsers set it on every write,
    // including form posts, so an attacker's page cannot omit it.
    if (!origin) return next();

    if (allowedOrigins.includes(origin)) return next();

    // A deployment that serves the SPA from the API itself needs no CORS
    // allowlist, so accept the request's own origin too.
    if (origin === `${req.protocol}://${req.get("host")}`) return next();

    res.status(403).json({ message: "Cross-site request blocked" });
  };
};
