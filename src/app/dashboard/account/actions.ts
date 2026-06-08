"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getStylistByClerkId, slugTaken, updateStylist } from "@/lib/db/repositories/stylists";
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

  await wrapDb(() =>
    updateStylist(userId, {
      name:   data.name,
      slug,
      studio: data.studio?.trim() || null,
      bio:    data.bio?.trim() || null,
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
