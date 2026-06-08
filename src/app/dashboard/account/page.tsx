import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Wordmark from "@/components/Wordmark";
import { PageHeader } from "@/components/PageHeader";
import ProfileForm from "./_components/ProfileForm";
import ServicesSection from "./_components/ServicesSection";
import { SignOutButton } from "./_components/SignOutButton";
import { type ServiceRow } from "./actions";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { getServicesByStylistId } from "@/lib/db/repositories/services";

function SectionDivider() {
  return <div className="border-t border-hairline my-10" />;
}

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
      <PageHeader>
        <Wordmark size="sm" />
      </PageHeader>

      <div className="max-w-[540px] mx-auto px-6 pt-8 pb-10">

        {/* ── Profile ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-near-black mb-1">Profile</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            What clients see when they visit your booking page.
          </p>
          <ProfileForm
            name={stylist?.name ?? ""}
            slug={stylist?.slug ?? ""}
            studio={stylist?.studio ?? null}
            bio={stylist?.bio ?? null}
          />
        </section>

        <SectionDivider />

        {/* ── Services ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-xl font-bold text-near-black">Services</h2>
            {services.length > 0 && (
              <span className="text-xs font-semibold text-muted">
                {services.length} {services.length === 1 ? "service" : "services"}
              </span>
            )}
          </div>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Your menu of offerings. These pre-fill slot details when you post a new opening.
          </p>
          <ServicesSection initial={services} />
        </section>

        <SectionDivider />

        {/* ── Account ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-near-black mb-1">Account</h2>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            Signing out will end your current session.
          </p>
          <SignOutButton />
        </section>

      </div>
    </main>
  );
}
