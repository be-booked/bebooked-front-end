"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { shortCodeExists, createSlot } from "@/lib/db/repositories/slots";

function generateShortCode(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function createSlotAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await getStylistByClerkId(userId);
  if (!stylist) throw new Error("No stylist profile found. Complete your profile first.");

  const serviceName  = (formData.get("service_name") as string)?.trim();
  const slotDate     = formData.get("slot_date") as string;   // "YYYY-MM-DD"
  const slotTime     = formData.get("slot_time") as string;   // "HH:MM"
  const durationMins = parseInt(formData.get("duration_mins") as string, 10);
  const priceCents   = Math.round(parseFloat(formData.get("price") as string) * 100);
  const note         = (formData.get("note") as string)?.trim() || null;

  if (!serviceName || !slotDate || !slotTime || isNaN(durationMins) || isNaN(priceCents)) {
    throw new Error("Missing required fields");
  }

  // Generate a unique short code (retry on collision)
  let shortCode = generateShortCode();
  for (let i = 0; i < 5; i++) {
    if (!(await shortCodeExists(shortCode))) break;
    shortCode = generateShortCode();
  }

  await createSlot({
    stylistId: stylist.id,
    serviceName,
    durationMins,
    priceCents,
    slotDate,
    slotTime,
    shortCode,
    note,
  });

  redirect("/dashboard");
}
