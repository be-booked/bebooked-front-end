import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DB = NeonHttpDatabase<typeof schema>;

let instance: DB | null = null;

/**
 * Builds the client on first use rather than at import time.
 *
 * Creating it at module scope meant any route importing `db` would throw
 * during `next build` — Next evaluates route modules while collecting page
 * data, and DATABASE_URL isn't available in a build environment. Deferring
 * to first query keeps the build independent of database availability.
 */
function getDb(): DB {
  if (instance) return instance;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — add it to the runtime environment (wrangler secret put DATABASE_URL).",
    );
  }

  instance = drizzle(neon(url), { schema });
  return instance;
}

/**
 * Proxy so call sites keep using `db.select(...)` unchanged while the real
 * client is constructed on first property access.
 */
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop) as unknown;
    return typeof value === "function" ? value.bind(real) : value;
  },
});
