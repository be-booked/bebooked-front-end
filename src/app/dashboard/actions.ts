"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { deleteOpenSlot } from "@/lib/db/repositories/slots";
import { wrapDb } from "@/lib/errors";

export async function deleteSlotAction(slotId: number): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const stylist = await wrapDb(() => getStylistByClerkId(userId));
  if (!stylist) throw new Error("No stylist profile found");

  // deleteOpenSlot is scoped to this stylist + status=open, so booked slots are safe
  await wrapDb(() => deleteOpenSlot(slotId, stylist.id));

  revalidatePath("/dashboard");
}
