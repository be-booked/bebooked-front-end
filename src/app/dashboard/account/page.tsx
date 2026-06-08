import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { PageHeader } from "@/components/PageHeader";
import ProfileForm from "./_components/ProfileForm";
import ServicesSection from "./_components/ServicesSection";
import { type ServiceRow } from "./actions";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { getServicesByStylistId } from "@/lib/db/repositories/services";

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let stylist: Awaited<ReturnType<typeof getStylistByClerkId>>;
  let services: ServiceRow[] = [];

  try {
    stylist = await getStylistByClerkId(userId);
    if (stylist) {
      const rows = await getServicesByStylistId(stylist.id);
      services = rows.map((r) => ({
        id: r.id,
        name: r.name,
        mins: r.durationMins,
        priceCents: r.priceCents,
      }));
    }
  } catch {
    // DB not connected — form still renders with empty defaults
  }

  return (
    <main className="min-h-screen bg-warm-cream">
      {/* Header */}
      <PageHeader className="gap-4">
        <Link href="/dashboard" className="text-near-black no-underline text-xl leading-none" aria-label="Back to dashboard">
          ←
        </Link>
        <Wordmark size="sm" />
      </PageHeader>

      {/* Body */}
      <div className="max-w-[540px] mx-auto px-6 pt-7 pb-20">
        <h1 className="text-2xl font-bold mb-1.5">Account &amp; profile</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Your profile is what clients see when they visit your booking page.
        </p>

        <ProfileForm
          name={stylist?.name ?? ""}
          slug={stylist?.slug ?? ""}
          studio={stylist?.studio ?? null}
          bio={stylist?.bio ?? null}
        />

        <ServicesSection initial={services} />
      </div>
    </main>
  );
}
