"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getStylistByClerkId, slugTaken, updateStylist } from "@/lib/db/repositories/stylists";
import {
  insertService,
  updateService as dbUpdateService,
  deleteService as dbDeleteService,
} from "@/lib/db/repositories/services";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const name   = (formData.get("name") as string)?.trim();
  const rawSlug = (formData.get("slug") as string)?.trim();
  const studio = (formData.get("studio") as string)?.trim() || null;
  const bio    = (formData.get("bio") as string)?.trim() || null;

  if (!name) throw new Error("Name is required");

  const slug = slugify(rawSlug || name);
  if (!slug) throw new Error("Handle is required");

  if (await slugTaken(slug, userId)) {
    throw new Error("That handle is already taken — try another");
  }

  await updateStylist(userId, { name, slug, studio, bio });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/account");
}

// ── Service CRUD ───────────────────────────────────────────────────────────

export interface ServiceRow {
  id: number;
  name: string;
  mins: number;
  priceCents: number;
}

export async function addService(formData: FormData): Promise<ServiceRow> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await getStylistByClerkId(userId);
  if (!stylist) throw new Error("Stylist not found");

  const name        = (formData.get("name") as string)?.trim();
  const durationMins = parseInt(formData.get("mins") as string) || 60;
  const priceCents  = Math.round((parseFloat(formData.get("price") as string) || 0) * 100);

  if (!name) throw new Error("Service name is required");

  const svc = await insertService(stylist.id, { name, durationMins, priceCents });

  revalidatePath("/dashboard/account");

  return { id: svc.id, name: svc.name, mins: svc.durationMins, priceCents: svc.priceCents };
}

export async function updateService(serviceId: number, formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await getStylistByClerkId(userId);
  if (!stylist) throw new Error("Stylist not found");

  const name        = (formData.get("name") as string)?.trim();
  const durationMins = parseInt(formData.get("mins") as string) || 60;
  const priceCents  = Math.round((parseFloat(formData.get("price") as string) || 0) * 100);

  if (!name) throw new Error("Service name is required");

  await dbUpdateService(serviceId, stylist.id, { name, durationMins, priceCents });

  revalidatePath("/dashboard/account");
}

export async function deleteService(serviceId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await getStylistByClerkId(userId);
  if (!stylist) throw new Error("Stylist not found");

  await dbDeleteService(serviceId, stylist.id);

  revalidatePath("/dashboard/account");
}
