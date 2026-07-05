"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getStylistByClerkId, slugTaken, updateStylist } from "@/lib/db/repositories/stylists";
import { createPresignedUploadUrl } from "@/lib/r2";
import {
  insertService,
  updateService as dbUpdateService,
  deleteService as dbDeleteService,
} from "@/lib/db/repositories/services";
import { profileSchema, serviceFormSchema, firstZodError } from "@/lib/schemas";
import { wrapDb } from "@/lib/errors";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── Photo upload ───────────────────────────────────────────────────────────

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

/** Returns a short-lived presigned PUT URL the client can upload to directly. */
export async function getPhotoUploadUrl(
  contentType: string,
): Promise<{ uploadUrl: string; filePublicUrl: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (!ALLOWED_TYPES.includes(contentType as AllowedType)) {
    throw new Error("Only JPEG, PNG, and WebP images are allowed");
  }

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("No stylist profile found");

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = `profiles/${stylist.id}/${randomUUID()}.${ext}`;

  return createPresignedUploadUrl(key, contentType);
}

/** Persists the uploaded photo URL to the stylist's profile. */
export async function savePhotoUrl(photoUrl: string): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("No stylist profile found");

  await wrapDb(() => updateStylist(userId, { photoUrl }));
  revalidatePath("/dashboard/account");
  revalidatePath(`/${stylist.slug}`);
}

// ── Profile ────────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  let data: z.infer<typeof profileSchema>;
  try {
    data = profileSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  const slug = slugify(data.slug || data.name);
  if (!slug) throw new Error("Handle is required");

  if (await wrapDb(() => slugTaken(slug, userId))) {
    throw new Error("That handle is already taken — try another");
  }

  // Arrays come through as multiple FormData entries with the same key
  const industry    = formData.getAll("industry").map(String).filter(Boolean);
  const specialties = formData.getAll("specialties").map(String).filter(Boolean);

  if (!industry.length) throw new Error("Select at least one specialty");

  await wrapDb(() =>
    updateStylist(userId, {
      name:               data.name,
      slug,
      studio:             data.studio?.trim() || null,
      bio:                data.bio?.trim() || null,
      phone:              data.phone?.replace(/\D/g, "") || null,
      addressStreet:      data.addressStreet?.trim() || null,
      addressCity:        data.addressCity?.trim() || null,
      addressState:       data.addressState?.toUpperCase().trim() || null,
      addressZip:         data.addressZip?.trim() || null,
      cancellationPolicy: data.cancellationPolicy?.trim() || null,
      industry:           industry.length ? industry : null,
      specialties:        specialties.length ? specialties : null,
    })
  );

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

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("Stylist not found");

  let data: z.infer<typeof serviceFormSchema>;
  try {
    data = serviceFormSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  const priceCents = Math.round(data.price * 100);
  const svc = await wrapDb(() =>
    insertService(stylist.id, { name: data.name, durationMins: data.mins, priceCents })
  );

  revalidatePath("/dashboard/account");

  return { id: svc.id, name: svc.name, mins: svc.durationMins, priceCents: svc.priceCents };
}

export async function updateService(serviceId: number, formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("Stylist not found");

  let data: z.infer<typeof serviceFormSchema>;
  try {
    data = serviceFormSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  const priceCents = Math.round(data.price * 100);
  await wrapDb(() =>
    dbUpdateService(serviceId, stylist.id, { name: data.name, durationMins: data.mins, priceCents })
  );

  revalidatePath("/dashboard/account");
}

export async function deleteService(serviceId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("Stylist not found");

  await wrapDb(() => dbDeleteService(serviceId, stylist.id));

  revalidatePath("/dashboard/account");
}
