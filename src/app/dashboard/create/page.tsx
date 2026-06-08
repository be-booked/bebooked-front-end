import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { getServicesByStylistId } from "@/lib/db/repositories/services";
import CreateSlotForm from "./_components/CreateSlotForm";

export interface ServiceOption {
  name: string;
  mins: number;
  price: number; // dollars
}

export default async function CreateSlotPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let services: ServiceOption[] = [];

  try {
    const stylist = await getStylistByClerkId(userId);
    if (stylist) {
      const rows = await getServicesByStylistId(stylist.id);
      services = rows.map((r) => ({
        name: r.name,
        mins: r.durationMins,
        price: r.priceCents / 100,
      }));
    }
  } catch {
    // DB not connected — form renders with empty list
  }

  return <CreateSlotForm services={services} />;
}
