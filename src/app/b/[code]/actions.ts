"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getSlotById, updateSlotStatus } from "@/lib/db/repositories/slots";
import { createBooking } from "@/lib/db/repositories/bookings";
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
    await createBooking({ slotId, clientName: data.client_name, clientPhone: data.client_phone });
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

  redirect(`/b/${shortCode}/confirmed`);
}
