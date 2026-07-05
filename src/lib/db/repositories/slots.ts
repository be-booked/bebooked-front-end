import { eq, and, or, asc, desc, lt, gte, inArray, sql, count } from "drizzle-orm";
import { db } from "../client";
import { slots, stylists, bookings } from "../schema";

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
      id:                 slots.id,
      serviceName:        slots.serviceName,
      durationMins:       slots.durationMins,
      priceCents:         slots.priceCents,
      slotDate:           slots.slotDate,
      slotTime:           slots.slotTime,
      status:             slots.status,
      shortCode:          slots.shortCode,
      note:               slots.note,
      bookingCutoffMins:  slots.bookingCutoffMins,
      stylistName:        stylists.name,
      studio:             stylists.studio,
      addressStreet:      stylists.addressStreet,
      addressCity:        stylists.addressCity,
      addressState:       stylists.addressState,
      addressZip:         stylists.addressZip,
      photoUrl:           stylists.photoUrl,
      slug:               stylists.slug,
      cancellationPolicy: stylists.cancellationPolicy,
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

/**
 * Slots for a stylist's public profile page:
 * - Open slots: only shown while still bookable (cutoff not yet passed).
 *   Future dates always qualify; today's slots must satisfy:
 *   (slotDate + slotTime - cutoffMins) > NOW()
 *   COALESCE(cutoffMins, 0) → no-cutoff slots disappear once the time passes.
 * - Booked slots: upcoming + last 30 days (social proof window)
 */
export async function getAllPublicSlotsBySlug(slug: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // Slot times are stored as UTC. NOW() is also UTC. The comparison is exact.
  // - No cutoff (NULL → COALESCE 0): slot disappears the moment its time passes.
  // - Explicit cutoff: slot disappears cutoffMins before its start time.
  const stillBookable = sql`(
    ${slots.slotDate} > CURRENT_DATE
    OR (
      ${slots.slotDate} = CURRENT_DATE
      AND (
        ${slots.slotDate}::date + ${slots.slotTime}::time
        - COALESCE(${slots.bookingCutoffMins}, 0) * INTERVAL '1 minute'
      ) > NOW()
    )
  )`;

  return db
    .select({
      id:           slots.id,
      shortCode:    slots.shortCode,
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
      status:       slots.status,
    })
    .from(slots)
    .innerJoin(stylists, eq(slots.stylistId, stylists.id))
    .where(and(
      eq(stylists.slug, slug),
      or(
        and(eq(slots.status, "open"),   stillBookable),
        and(eq(slots.status, "booked"), gte(slots.slotDate, thirtyDaysAgo)),
      ),
    ))
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
  bookingCutoffMins: number | null;
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

/** Hard-delete an open slot. Scoped to stylistId so a stylist can't delete another's slot. */
export async function deleteOpenSlot(slotId: number, stylistId: number): Promise<void> {
  await db
    .delete(slots)
    .where(and(eq(slots.id, slotId), eq(slots.stylistId, stylistId), eq(slots.status, "open")));
}

// Slot times are stored as UTC. NOW() is UTC. These expressions are exact.
// "upcoming": appointment time hasn't arrived yet.
// "past":     appointment time has passed — slot is done regardless of status.
const slotIsUpcoming = sql`(${slots.slotDate}::date + ${slots.slotTime}::time > NOW())`;
const slotIsPast     = sql`(${slots.slotDate}::date + ${slots.slotTime}::time <= NOW())`;

/** Active tab: open + booked slots whose appointment time hasn't passed yet. */
export async function getActiveSlotsForDashboard(stylistId: number) {
  return db
    .select({
      id:           slots.id,
      shortCode:    slots.shortCode,
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
      status:       slots.status,
      clientName:   bookings.clientName,
      clientPhone:  bookings.clientPhone,
    })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .where(and(
      eq(slots.stylistId, stylistId),
      inArray(slots.status, ["open", "booked"]),
      slotIsUpcoming,
    ))
    .orderBy(asc(slots.slotDate), asc(slots.slotTime));
}

/**
 * Fill rate: non-cancelled slots whose appointment time has passed.
 * open+past = unfilled, booked+past = filled.
 */
export async function getSlotFillRate(stylistId: number): Promise<{ total: number; booked: number }> {
  const rows = await db
    .select({
      total:  count(),
      booked: sql<number>`COUNT(*) FILTER (WHERE ${slots.status} = 'booked')`,
    })
    .from(slots)
    .where(and(
      eq(slots.stylistId, stylistId),
      inArray(slots.status, ["open", "booked"]),
      slotIsPast,
    ));
  return { total: rows[0]?.total ?? 0, booked: Number(rows[0]?.booked ?? 0) };
}

/** History tab: all slots whose appointment time has passed, newest first. */
export async function getHistorySlotsForDashboard(stylistId: number) {
  return db
    .select({
      id:           slots.id,
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
      status:       slots.status,
      clientName:   bookings.clientName,
    })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .where(and(
      eq(slots.stylistId, stylistId),
      slotIsPast,
    ))
    .orderBy(desc(slots.slotDate), desc(slots.slotTime));
}
