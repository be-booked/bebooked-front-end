import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Avatar, EyebrowLabel, Card, Button } from "@/components/ui";
import Wordmark from "@/components/Wordmark";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getStylistBySlug } from "@/lib/db/repositories/stylists";
import { getOpenSlotsBySlug } from "@/lib/db/repositories/slots";

// ── Types ──────────────────────────────────────────────────────────────────

interface PublicSlot {
  id: number;
  shortCode: string;
  name: string;
  when: string;
  mins: number;
  priceDisplay: string;
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stylist = await getStylistBySlug(slug);
  if (!stylist) return { title: "BeBooked" };
  return {
    title: `${stylist.name}${stylist.studio ? ` · ${stylist.studio}` : ""} | BeBooked`,
    description: `Book a last-minute opening with ${stylist.name} on BeBooked.`,
  };
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const stylist = await getStylistBySlug(slug);
  if (!stylist) notFound();

  const slotRows = await getOpenSlotsBySlug(slug);

  const slots: PublicSlot[] = slotRows.map((r) => ({
    id:           r.id,
    shortCode:    r.shortCode,
    name:         r.serviceName,
    when:         formatSlotWhen(r.slotDate, r.slotTime),
    mins:         r.durationMins,
    priceDisplay: formatPrice(r.priceCents),
  }));

  const meta = [stylist.studio, stylist.location].filter(Boolean).join(" · ");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ── Profile hero ─────────────────────────────────────────────────── */}
      <div
        style={{
          background: "var(--warm-cream)",
          borderBottom: "1px solid var(--hairline)",
          padding: "32px var(--gutter) 24px",
        }}
      >
        <div style={{ maxWidth: "var(--app-max)", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <Avatar name={stylist.name} src={stylist.photoUrl ?? undefined} size={64} />
            <div>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "var(--weight-bold)",
                  color: "var(--text-primary)",
                  marginBottom: 4,
                  lineHeight: 1.2,
                }}
              >
                {stylist.name}
              </h1>
              {meta && (
                <div style={{ fontSize: "var(--size-small)", color: "var(--text-muted)" }}>
                  {meta}
                </div>
              )}
              {stylist.bio && (
                <p
                  style={{
                    fontSize: "var(--size-small)",
                    color: "var(--text-secondary)",
                    marginTop: 10,
                    lineHeight: "var(--leading-relaxed)",
                    maxWidth: 460,
                  }}
                >
                  {stylist.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Slots ────────────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "var(--app-max)",
          margin: "0 auto",
          padding: "24px var(--gutter) 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <EyebrowLabel>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: slots.length > 0 ? "var(--sage)" : "var(--stone)",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            Open slots
          </EyebrowLabel>
          <span
            style={{
              fontSize: "var(--size-caption)",
              color: "var(--text-muted)",
              fontWeight: "var(--weight-medium)",
            }}
          >
            {slots.length} available
          </span>
        </div>

        {slots.length === 0 ? (
          <div
            style={{ textAlign: "center", padding: "56px 24px", color: "var(--text-muted)" }}
          >
            <p style={{ fontSize: "var(--size-small)", lineHeight: 1.6 }}>
              No open slots right now. Check back soon.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} role="list">
            {slots.map((slot) => (
              <div key={slot.id} role="listitem">
                <SlotCard slot={slot} />
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: 48,
            fontSize: "var(--size-caption)",
            color: "var(--text-muted)",
          }}
        >
          Powered by{" "}
          <Wordmark size="sm" style={{ fontSize: 14, verticalAlign: "middle" }} />
        </div>
      </div>
    </main>
  );
}

// ── Slot card ──────────────────────────────────────────────────────────────

function SlotCard({ slot }: { slot: PublicSlot }) {
  return (
    <Card variant="raised" radius="md" padding="18px">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: "var(--weight-bold)",
              fontSize: "var(--size-body)",
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {slot.name}
          </div>
          <div style={{ fontSize: "var(--size-small)", color: "var(--text-muted)" }}>
            {slot.when} · {slot.mins} min
          </div>
        </div>
        <div
          style={{
            fontWeight: "var(--weight-bold)",
            fontSize: "var(--size-body)",
            color: "var(--text-primary)",
          }}
        >
          {slot.priceDisplay}
        </div>
      </div>
      <Link href={`/b/${slot.shortCode}`} style={{ display: "block", textDecoration: "none" }}>
        <Button variant="accent" size="sm" style={{ width: "100%" }}>
          Book this slot
        </Button>
      </Link>
    </Card>
  );
}
