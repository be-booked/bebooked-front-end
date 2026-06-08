"use server";

import { redirect } from "next/navigation";
import { getSlotById, updateSlotStatus } from "@/lib/db/repositories/slots";
import { createBooking } from "@/lib/db/repositories/bookings";

export async function bookSlot(
  formData: FormData,
  slotId: number,
  shortCode: string
) {
  const clientName  = (formData.get("client_name") as string)?.trim();
  const clientPhone = (formData.get("client_phone") as string)?.trim();

  if (!clientName)  throw new Error("Name is required");
  if (!clientPhone) throw new Error("Phone number is required");

  // Verify slot is still open
  const slot = await getSlotById(slotId);
  if (!slot) throw new Error("Slot not found");
  if (slot.status !== "open") {
    throw new Error("This slot has already been booked. Try another opening.");
  }

  // Insert booking — UNIQUE constraint on slot_id prevents double-booking
  try {
    await createBooking({ slotId, clientName, clientPhone });
  } catch {
    throw new Error("This slot was just booked by someone else. Try another opening.");
  }

  await updateSlotStatus(slotId, "booked");

  redirect(`/b/${shortCode}/confirmed`);
}
