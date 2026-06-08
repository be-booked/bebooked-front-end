import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
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
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--warm-cream)",
          borderBottom: "1px solid var(--hairline)",
          padding: "14px var(--gutter)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "20px",
            lineHeight: 1,
          }}
          aria-label="Back to dashboard"
        >
          ←
        </Link>
        <Wordmark size="sm" />
      </header>

      {/* Body */}
      <div
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "28px var(--gutter) 80px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Account &amp; profile
        </h1>
        <p
          style={{
            fontSize: "var(--size-small)",
            color: "var(--text-muted)",
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
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
