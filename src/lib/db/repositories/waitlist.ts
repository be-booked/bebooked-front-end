import { count } from "drizzle-orm";
import { db } from "../client";
import { waitlist } from "../schema";

/** Total waitlist signups — used for social proof on the landing page. */
export async function getWaitlistCount(): Promise<number> {
  const rows = await db.select({ total: count() }).from(waitlist);
  return rows[0]?.total ?? 0;
}
