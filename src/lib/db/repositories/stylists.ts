import { eq, ne, and } from "drizzle-orm";
import { db } from "../client";
import { stylists } from "../schema";

export type Stylist = typeof stylists.$inferSelect;
type NewStylist = typeof stylists.$inferInsert;
type UpdateStylistData = Partial<
  Pick<Stylist, "name" | "slug" | "studio" | "location" | "bio" | "photoUrl">
>;

export async function getStylistByClerkId(
  clerkUserId: string
): Promise<Stylist | undefined> {
  const rows = await db
    .select()
    .from(stylists)
    .where(eq(stylists.clerkUserId, clerkUserId))
    .limit(1);
  return rows[0];
}

export async function getStylistBySlug(
  slug: string
): Promise<Stylist | undefined> {
  const rows = await db
    .select()
    .from(stylists)
    .where(and(eq(stylists.slug, slug), eq(stylists.isActive, true)))
    .limit(1);
  return rows[0];
}

/** Returns true if slug is already in use (optionally excluding one clerk user). */
export async function slugTaken(
  slug: string,
  excludeClerkUserId?: string
): Promise<boolean> {
  const condition = excludeClerkUserId
    ? and(eq(stylists.slug, slug), ne(stylists.clerkUserId, excludeClerkUserId))
    : eq(stylists.slug, slug);
  const rows = await db
    .select({ id: stylists.id })
    .from(stylists)
    .where(condition)
    .limit(1);
  return rows.length > 0;
}

export async function createStylist(data: NewStylist): Promise<Stylist> {
  const [row] = await db.insert(stylists).values(data).returning();
  return row;
}

export async function updateStylist(
  clerkUserId: string,
  data: UpdateStylistData
): Promise<void> {
  await db
    .update(stylists)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(stylists.clerkUserId, clerkUserId));
}
