"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { getSlotById, updateSlotStatus } from "@/lib/db/repositories/slots";
import { createBooking, getBookingEmailData } from "@/lib/db/repositories/bookings";
import {
  sendBookingConfirmation,
  sendNewBookingAlert,
} from "@/lib/email/booking";
import { bookingSchema, firstZodError } from "@/lib/schemas";
import { wrapDb, parseDbError } from "@/lib/errors";

export async function bookSlot(
  formData: FormData,
  slotId: number,
  shortCode: string
) {
  let data: z.infer<typeof bookingSchema>;
  try {
    data = bookingSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  // Verify slot is still open
  const slot = await wrapDb(() => getSlotById(slotId));
  if (!slot) throw new Error("Slot not found");
  if (slot.status !== "open") {
    throw new Error("This slot has already been booked. Try another opening.");
  }

  // Insert booking — UNIQUE constraint on slot_id prevents double-booking
  try {
    await createBooking({
      slotId,
      clientName:  data.client_name,
      clientPhone: data.client_phone,
      clientEmail: data.client_email || undefined,
    });
  } catch (err) {
    // Unique constraint = race condition double-book; anything else gets translated too
    const msg = parseDbError(err);
    throw new Error(
      msg === "A record with those details already exists"
        ? "This slot was just booked by someone else. Try another opening."
        : msg
    );
  }

  await wrapDb(() => updateSlotStatus(slotId, "booked"));

  // Notifications are best-effort — the booking is already committed, so a
  // mail failure must never surface to the client or block the redirect.
  // Must run before redirect(), which throws by design.
  await sendBookingEmails(slotId);

  redirect(`/b/${shortCode}/confirmed`);
}

async function sendBookingEmails(slotId: number): Promise<void> {
  try {
    const row = await getBookingEmailData(slotId);
    if (!row) return;

    // stylists has no email column — Clerk holds the pro's address
    let proEmail: string | null = null;
    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(row.clerkUserId);
      proEmail = user.primaryEmailAddress?.emailAddress ?? null;
    } catch (err) {
      console.error("[booking] could not resolve pro email from Clerk:", err);
    }

    const data = { ...row, proEmail };

    await Promise.allSettled([
      sendBookingConfirmation(data),
      sendNewBookingAlert(data),
    ]);
  } catch (err) {
    console.error("[booking] notification step failed:", err);
  }
}
