import "dotenv/config";

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"] as const;

const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env variables: ${missing.join(", ")}`);
  process.exit(1);
}

const DAY_MS = 24 * 60 * 60 * 1000;

export const env = {
  MONGO_URI: process.env.MONGO_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  /** Cookie lifetime; keep in step with JWT_EXPIRES_IN. */
  SESSION_MAX_AGE_MS: Number(process.env.SESSION_MAX_AGE_MS) || 7 * DAY_MS,
  /** Set when the API and the SPA are on different sites. */
  CROSS_SITE_COOKIES: Boolean(process.env.CROSS_SITE_COOKIES),
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL ?? "",
  PUBLIC_URL: process.env.PUBLIC_URL,
  TRUST_PROXY: Boolean(process.env.TRUST_PROXY),
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
