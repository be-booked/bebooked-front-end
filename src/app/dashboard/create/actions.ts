"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { shortCodeExists, createSlot } from "@/lib/db/repositories/slots";
import { createSlotSchema, firstZodError } from "@/lib/schemas";
import { wrapDb } from "@/lib/errors";

function generateShortCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function createSlotAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("No stylist profile found. Complete your profile first.");

  let data: z.infer<typeof createSlotSchema>;
  try {
    data = createSlotSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  const priceCents = Math.round(data.price * 100);
  const note       = data.note?.trim() || null;

  // Generate a unique short code (retry on collision)
  let shortCode = generateShortCode();
  for (let i = 0; i < 5; i++) {
    if (!(await wrapDb(() => shortCodeExists(shortCode)))) break;
    shortCode = generateShortCode();
  }

  await wrapDb(() =>
    createSlot({
      stylistId:    stylist.id,
      serviceName:  data.service_name,
      durationMins: data.duration_mins,
      priceCents,
      slotDate:     data.slot_date,
      slotTime:     data.slot_time,
      shortCode,
      note,
    })
  );

  redirect("/dashboard");
}
