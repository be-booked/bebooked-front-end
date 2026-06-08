import { eq } from "drizzle-orm";
import { db } from "../client";
import { bookings, slots, stylists } from "../schema";

export type Booking = typeof bookings.$inferSelect;

export async function createBooking(data: {
  slotId: number;
  clientName: string;
  clientPhone: string;
}): Promise<Booking> {
  const [row] = await db.insert(bookings).values(data).returning();
  return row;
}

/** Full join for the confirmation page (/b/[code]/confirmed). */
export async function getBookingDetails(shortCode: string) {
  const rows = await db
    .select({
      serviceName:  slots.serviceName,
      durationMins: slots.durationMins,
      priceCents:   slots.priceCents,
      slotDate:     slots.slotDate,
      slotTime:     slots.slotTime,
      stylistName:  stylists.name,
      studio:       stylists.studio,
      location:     stylists.location,
      photoUrl:     stylists.photoUrl,
      slug:         stylists.slug,
      clientName:   bookings.clientName,
      clientPhone:  bookings.clientPhone,
    })
    .from(slots)
    .innerJoin(stylists, eq(slots.stylistId, stylists.id))
    .innerJoin(bookings, eq(bookings.slotId, slots.id))
    .where(eq(slots.shortCode, shortCode))
    .limit(1);
  return rows[0];
}
