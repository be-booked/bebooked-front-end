"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { slugTaken, createStylist } from "@/lib/db/repositories/stylists";
import { bulkInsertServices } from "@/lib/db/repositories/services";
import { profileSchema, serviceDraftSchema, firstZodError } from "@/lib/schemas";
import { wrapDb } from "@/lib/errors";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 10; i++) {
    if (!(await wrapDb(() => slugTaken(slug)))) return slug;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now()}`;
}

export type ServiceDraft = z.infer<typeof serviceDraftSchema>;

export async function saveSetup(formData: FormData, services: ServiceDraft[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  let profile: z.infer<typeof profileSchema>;
  try {
    profile = profileSchema.parse(Object.fromEntries(formData));
  } catch (err) {
    if (err instanceof z.ZodError) throw new Error(firstZodError(err));
    throw err;
  }

  // Arrays come through as multiple FormData entries with the same key
  const industry    = formData.getAll("industry").map(String).filter(Boolean);
  const specialties = formData.getAll("specialties").map(String).filter(Boolean);

  if (!industry.length) throw new Error("Select at least one specialty");

  // Validate all service drafts
  const parsedServices = services.map((s, i) => {
    try {
      return serviceDraftSchema.parse(s);
    } catch (err) {
      if (err instanceof z.ZodError) {
        throw new Error(`Service ${i + 1}: ${firstZodError(err)}`);
      }
      throw err;
    }
  });

  const slug = await uniqueSlug(slugify(profile.name) || "stylist");

  const stylist = await wrapDb(() =>
    createStylist({
      clerkUserId:        userId,
      name:               profile.name,
      slug,
      studio:             profile.studio?.trim() || null,
      bio:                profile.bio?.trim() || null,
      phone:              profile.phone?.replace(/\D/g, "") || null,
      addressStreet:      profile.addressStreet?.trim() || null,
      addressCity:        profile.addressCity?.trim() || null,
      addressState:       profile.addressState?.toUpperCase().trim() || null,
      addressZip:         profile.addressZip?.trim() || null,
      cancellationPolicy: profile.cancellationPolicy?.trim() || null,
      industry:           industry.length ? industry : null,
      specialties:        specialties.length ? specialties : null,
    })
  );

  await wrapDb(() =>
    bulkInsertServices(
      stylist.id,
      parsedServices.map((s) => ({
        name:         s.name,
        durationMins: s.mins,
        priceCents:   Math.round(s.price * 100),
      }))
    )
  );

  redirect("/dashboard");
}
