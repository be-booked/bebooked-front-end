import { eq, and, asc } from "drizzle-orm";
import { db } from "../client";
import { slots, stylists } from "../schema";

export type Slot = typeof slots.$inferSelect;

export async function getOpenSlotsByStylistId(stylistId: number): Promise<Slot[]> {
  return db
    .select()
    .from(slots)
    .where(and(eq(slots.stylistId, stylistId), eq(slots.status, "open")))
    .orderBy(asc(slots.slotDate), asc(slots.slotTime));
}

export async function getSlotById(slotId: number): Promise<Slot | undefined> {
  const rows = await db
    .select()
    .from(slots)
    .where(eq(slots.id, slotId))
    .limit(1);
  return rows[0];
}

/** Slot + stylist join for the booking page (/b/[code]). */
export async function getSlotWithStylistByCode(code: string) {
  const rows = await db
    .select({
      id:           slots.id,
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
      status:       slots.status,
      shortCode:    slots.shortCode,
      note:         slots.note,
      stylistName:  stylists.name,
      studio:       stylists.studio,
      location:     stylists.location,
      photoUrl:     stylists.photoUrl,
      slug:         stylists.slug,
    })
    .from(slots)
    .innerJoin(stylists, eq(slots.stylistId, stylists.id))
    .where(eq(slots.shortCode, code))
    .limit(1);
  return rows[0];
}

/** Open slots for a stylist's public profile page. */
export async function getOpenSlotsBySlug(slug: string) {
  return db
    .select({
      id:           slots.id,
      shortCode:    slots.shortCode,
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
    })
    .from(slots)
    .innerJoin(stylists, eq(slots.stylistId, stylists.id))
    .where(and(eq(stylists.slug, slug), eq(slots.status, "open")))
    .orderBy(asc(slots.slotDate), asc(slots.slotTime));
}

export async function shortCodeExists(code: string): Promise<boolean> {
  const rows = await db
    .select({ id: slots.id })
    .from(slots)
    .where(eq(slots.shortCode, code))
    .limit(1);
  return rows.length > 0;
}

export async function createSlot(data: {
  stylistId: number;
  serviceName: string;
  durationMins: number;
  priceCents: number;
  slotDate: string;
  slotTime: string;
  shortCode: string;
  note: string | null;
}): Promise<void> {
  await db.insert(slots).values(data);
}

export async function updateSlotStatus(
  slotId: number,
  status: "open" | "booked" | "cancelled"
): Promise<void> {
  await db
    .update(slots)
    .set({ status, updatedAt: new Date() })
    .where(eq(slots.id, slotId));
}
