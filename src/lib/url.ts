/**
 * Full base URL for the app (no trailing slash).
 * Always set NEXT_PUBLIC_APP_URL in your deployment environment.
 *
 * .env.local (local machine) → NEXT_PUBLIC_APP_URL=http://localhost:3000
 * Dev deployment             → NEXT_PUBLIC_APP_URL=https://dev.bebookedtoday.com
 * Production                 → NEXT_PUBLIC_APP_URL=https://bebookedtoday.com
 *
 * The NODE_ENV fallback below only fires if the var is missing entirely,
 * which in practice only happens when running `next dev` locally.
 */
export const APP_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://bebookedtoday.com");

/** Hostname only, no protocol (for display). e.g. "localhost:3000" or "bebookedtoday.com" */
export const APP_HOST: string = APP_URL.replace(/^https?:\/\//, "");
