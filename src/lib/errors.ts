import { NeonDbError } from "@neondatabase/serverless";

// Postgres error codes we care about
const PG = {
  UNIQUE_VIOLATION:     "23505",
  FK_VIOLATION:         "23503",
  NOT_NULL_VIOLATION:   "23502",
  CONNECTION_FAILURE:   "08006",
  CONNECTION_EXCEPTION: "08000",
  CONNECTION_CLOSED:    "08003",
  ADMIN_SHUTDOWN:       "57P01",
  TOO_MANY_CONNECTIONS: "53300",
  QUERY_CANCELED:       "57014",
} as const;

/**
 * Translate a raw DB error (NeonDbError, Drizzle, network, etc.) into a
 * short, user-facing string. Never leaks SQL internals.
 */
export function parseDbError(err: unknown): string {
  if (err instanceof NeonDbError) {
    switch (err.code) {
      case PG.UNIQUE_VIOLATION: {
        const c = err.constraint ?? "";
        if (c.includes("slug"))       return "That handle is already taken — try another";
        if (c.includes("short_code")) return "Please try again";
        return "A record with those details already exists";
      }
      case PG.FK_VIOLATION:
        return "Referenced record not found";
      case PG.NOT_NULL_VIOLATION:
        return "A required field is missing";
      case PG.CONNECTION_FAILURE:
      case PG.CONNECTION_EXCEPTION:
      case PG.CONNECTION_CLOSED:
      case PG.ADMIN_SHUTDOWN:
        return "Database connection lost — please try again";
      case PG.TOO_MANY_CONNECTIONS:
        return "Service is busy — please try again shortly";
      case PG.QUERY_CANCELED:
        return "Request timed out — please try again";
    }
  }

  // Network / generic errors (fetch timeout, ECONNREFUSED, etc.)
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("connect") || msg.includes("econnrefused") || msg.includes("fetch")) {
      return "Could not reach the database — please try again";
    }
  }

  return "Something went wrong — please try again";
}

/**
 * Wrap a single async DB call and translate any thrown error into a
 * user-facing Error. Re-throws non-DB errors (e.g. redirect) untouched.
 *
 * Usage:
 *   const stylist = await wrapDb(() => getStylistByClerkId(userId));
 */
export async function wrapDb<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    throw new Error(parseDbError(err));
  }
}
