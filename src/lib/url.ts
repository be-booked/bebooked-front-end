/**
 * Full base URL for the app (no trailing slash).
 * Set NEXT_PUBLIC_APP_URL in your env to override.
 *
 * .env.local  → NEXT_PUBLIC_APP_URL=http://localhost:3000
 * Cloudflare  → NEXT_PUBLIC_APP_URL=https://bebookedtoday.com
 */
export const APP_URL: string =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://bebookedtoday.com");

/** Hostname only, no protocol (for display). e.g. "localhost:3000" or "bebookedtoday.com" */
export const APP_HOST: string = APP_URL.replace(/^https?:\/\//, "");
