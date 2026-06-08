import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { waitlist, stylists, services, slots, bookings } from "@/lib/db/schema";

export const runtime = "edge";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const checks: Record<string, unknown> = {
    env_set:       !!dbUrl,
    db_url_prefix: dbUrl ? dbUrl.slice(0, 35) + "…" : "NOT SET",
  };

  const tables = [
    { key: "waitlist",  table: waitlist },
    { key: "stylists",  table: stylists },
    { key: "services",  table: services },
    { key: "slots",     table: slots },
    { key: "bookings",  table: bookings },
  ] as const;

  for (const { key, table } of tables) {
    try {
      const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
      checks[`table_${key}`] = `✓ exists (${row.n} rows)`;
    } catch (err) {
      checks[`table_${key}`] = `✗ ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return NextResponse.json(checks, { status: 200 });
}
