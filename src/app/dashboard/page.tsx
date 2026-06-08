import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { Button, EyebrowLabel } from "@/components/ui";
import SlotCard, { type SlotCardData } from "./_components/SlotCard";
import NavAvatar from "./_components/NavAvatar";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { getOpenSlotsByStylistId } from "@/lib/db/repositories/slots";

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // ── Fetch stylist record — redirect to setup if none exists ───────────────
  let stylist: Awaited<ReturnType<typeof getStylistByClerkId>>;
  let dbError = false;

  try {
    stylist = await getStylistByClerkId(userId);
  } catch {
    dbError = true;
  }

  if (!dbError && !stylist) {
    redirect("/dashboard/setup");
  }

  // ── Fetch open slots ──────────────────────────────────────────────────────
  let slots: SlotCardData[] = [];
  let slotsError: string | null = null;

  if (!dbError && stylist) {
    try {
      const rows = await getOpenSlotsByStylistId(stylist.id);
      slots = rows.map((r) => ({
        id: r.id,
        name: r.serviceName,
        when: formatSlotWhen(r.slotDate, r.slotTime),
        mins: r.durationMins,
        priceDisplay: formatPrice(r.priceCents),
        shortCode: r.shortCode,
      }));
    } catch (err) {
      slotsError = err instanceof Error ? err.message : String(err);
      console.error("[dashboard] slots query failed:", slotsError);
    }
  }

  const stylistName = stylist?.name ?? "there";

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: "var(--warm-cream)",
          borderBottom: "1px solid var(--hairline)",
          padding: "14px var(--gutter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Wordmark size="sm" />
        <NavAvatar
          name={stylistName}
          src={stylist?.photoUrl ?? undefined}
          size={34}
        />
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "24px var(--gutter) 64px",
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 4,
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-primary)",
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            My slots
          </h1>
          <EyebrowLabel tone="muted" style={{ marginBottom: 4 }}>
            {stylist?.location ?? ""}
          </EyebrowLabel>
        </div>

        {/* Subtitle / status */}
        <p
          style={{
            fontSize: "var(--size-small)",
            color: "var(--text-muted)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: slots.length > 0 ? "var(--sage)" : "var(--stone)",
              flexShrink: 0,
            }}
          />
          {dbError
            ? "Database not connected yet"
            : slots.length === 0
            ? "No open slots · post one to get started"
            : `${slots.length} open slot${slots.length === 1 ? "" : "s"} · share to fill them`}
        </p>

        {/* Action row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <Link href="/dashboard/create" style={{ flex: 1, textDecoration: "none" }}>
            <Button variant="primary" style={{ width: "100%" }}>
              + Post a new slot
            </Button>
          </Link>
          <ShareProfileButton slug={stylist?.slug} />
        </div>

        {/* Slot list / empty state */}
        {slotsError && (
          <p
            style={{
              fontSize: "var(--size-small)",
              color: "var(--danger)",
              background: "rgba(164,70,47,0.08)",
              border: "1px solid rgba(164,70,47,0.25)",
              padding: "12px 16px",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            <strong>Slots query error:</strong> {slotsError}
          </p>
        )}
        {slots.length === 0 && !slotsError && <EmptyState dbError={dbError} />}
        {slots.length > 0 && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
            role="list"
            aria-label="Your open slots"
          >
            {slots.map((s) => (
              <div key={s.id} role="listitem">
                <SlotCard slot={s} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Share profile button ───────────────────────────────────────────────────

function ShareProfileButton({ slug }: { slug?: string }) {
  const href = slug ? `https://bebookedtoday.com/${slug}` : "#";
  return (
    <a
      href={href}
      target={slug ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-label="View your public profile"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "13px 24px",
        fontFamily: "var(--font-sans)",
        fontSize: "15px",
        fontWeight: "var(--weight-bold)",
        letterSpacing: "0.04em",
        lineHeight: 1,
        whiteSpace: "nowrap",
        border: "1.5px solid var(--border-default)",
        background: "transparent",
        color: "var(--text-primary)",
        textDecoration: "none",
        flexShrink: 0,
      }}
    >
      Share profile
    </a>
  );
}

// ── Empty / error states ───────────────────────────────────────────────────

function EmptyState({ dbError }: { dbError: boolean }) {
  if (dbError) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 24px",
          color: "var(--text-muted)",
        }}
      >
        <p
          style={{
            fontSize: "var(--size-small)",
            lineHeight: 1.6,
            maxWidth: 320,
            margin: "0 auto",
          }}
        >
          Database isn&apos;t connected yet. Add your{" "}
          <code
            style={{
              fontFamily: "monospace",
              background: "var(--warm-linen)",
              padding: "1px 5px",
              borderRadius: 2,
            }}
          >
            DATABASE_URL
          </code>{" "}
          to{" "}
          <code style={{ fontFamily: "monospace" }}>.env.local</code> and run
          the setup SQL in Neon.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: "center",
        padding: "56px 24px",
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-md)",
          background: "var(--stone)",
          margin: "0 auto 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
        aria-hidden="true"
      >
        ✂️
      </div>
      <p
        style={{
          fontWeight: "var(--weight-bold)",
          fontSize: "var(--size-body)",
          color: "var(--text-primary)",
          margin: "0 0 8px",
        }}
      >
        No open slots yet
      </p>
      <p
        style={{
          fontSize: "var(--size-small)",
          color: "var(--text-muted)",
          lineHeight: 1.6,
          maxWidth: 280,
          margin: "0 auto 24px",
        }}
      >
        Post your first opening and share the link to get booked in minutes.
      </p>
      <Link href="/dashboard/create" style={{ textDecoration: "none" }}>
        <Button variant="accent" size="sm">
          Post your first slot
        </Button>
      </Link>
    </div>
  );
}
