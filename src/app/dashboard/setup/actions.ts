"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { slugTaken, createStylist } from "@/lib/db/repositories/stylists";
import { bulkInsertServices } from "@/lib/db/repositories/services";

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  for (let i = 0; i < 10; i++) {
    if (!(await slugTaken(slug))) return slug;
    slug = `${base}-${i + 1}`;
  }
  return `${base}-${Date.now()}`;
}

export type ServiceDraft = {
  name: string;
  mins: number;
  price: number; // dollars
};

export async function saveSetup(formData: FormData, services: ServiceDraft[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const name     = (formData.get("name") as string)?.trim();
  const studio   = (formData.get("studio") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || "Charlotte, NC";
  const bio      = (formData.get("bio") as string)?.trim() || null;

  if (!name) throw new Error("Name is required");

  const slug = await uniqueSlug(slugify(name) || "stylist");

  const stylist = await createStylist({
    clerkUserId: userId,
    name,
    slug,
    studio,
    location,
    bio,
  });

  await bulkInsertServices(
    stylist.id,
    services.map((s) => ({
      name: s.name,
      durationMins: s.mins,
      priceCents: Math.round(s.price * 100),
    }))
  );

  redirect("/dashboard/create");
}
