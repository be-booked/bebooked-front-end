import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, EyebrowLabel, Card } from "@/components/ui";
import Wordmark from "@/components/Wordmark";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getSlotWithStylistByCode } from "@/lib/db/repositories/slots";
import BookForm from "./_components/BookForm";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const row = await getSlotWithStylistByCode(code);
  if (!row) notFound();

  // ── Slot no longer available ────────────────────────────────────────────
  if (row.status !== "open") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "var(--warm-cream)",
          fontFamily: "var(--font-sans)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 320 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
          <h1
            style={{
              fontSize: "var(--size-title)",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-primary)",
              marginBottom: 8,
            }}
          >
            Slot no longer available
          </h1>
          <p
            style={{
              fontSize: "var(--size-small)",
              color: "var(--text-muted)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            This opening has already been booked. Check back for new slots.
          </p>
          <Link
            href={`/${row.slug}`}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--size-small)",
              color: "var(--sage)",
              textDecoration: "underline",
            }}
          >
            See other openings
          </Link>
        </div>
      </main>
    );
  }

  // ── Active booking page ─────────────────────────────────────────────────
  const slot = {
    id:           row.id,
    name:         row.serviceName,
    when:         formatSlotWhen(row.slotDate, row.slotTime),
    mins:         row.durationMins,
    priceDisplay: formatPrice(row.priceCents),
    shortCode:    row.shortCode,
  };

  const meta = [row.studio, row.location].filter(Boolean).join(" · ");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--app-max)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 0",
            marginBottom: 6,
          }}
        >
          <Link
            href={`/${row.slug}`}
            aria-label="Back"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 34,
              height: 34,
              color: "var(--text-primary)",
              textDecoration: "none",
              fontSize: 20,
            }}
          >
            ←
          </Link>
          <EyebrowLabel tone="muted">Booking</EyebrowLabel>
          <span style={{ width: 34 }} />
        </header>

        {/* ── Stylist ────────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            margin: "6px 0 22px",
          }}
        >
          <Avatar name={row.stylistName} src={row.photoUrl ?? undefined} size={52} />
          <div>
            <div
              style={{
                fontWeight: "var(--weight-bold)",
                fontSize: "17px",
                color: "var(--text-primary)",
                marginBottom: 2,
              }}
            >
              {row.stylistName}
            </div>
            {meta && (
              <div
                style={{
                  fontSize: "var(--size-small)",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                }}
              >
                {meta}
              </div>
            )}
          </div>
        </div>

        {/* ── Slot detail card ───────────────────────────────────────────── */}
        <EyebrowLabel tone="accent" style={{ marginBottom: 10, display: "block" }}>
          Last-minute opening
        </EyebrowLabel>

        <Card variant="inverse" radius="lg" padding="22px" style={{ marginBottom: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: "var(--weight-bold)",
                  fontSize: "18px",
                  color: "var(--text-on-dark)",
                  marginBottom: 8,
                }}
              >
                {slot.name}
              </div>
              <div
                style={{
                  fontSize: "var(--size-small)",
                  color: "rgba(250,248,243,0.65)",
                  marginBottom: 4,
                }}
              >
                📅 {slot.when}
              </div>
              <div style={{ fontSize: "var(--size-small)", color: "rgba(250,248,243,0.65)" }}>
                ⏱ {slot.mins} min
              </div>
            </div>
            <div
              style={{
                fontWeight: "var(--weight-bold)",
                fontSize: "22px",
                color: "var(--text-on-dark)",
              }}
            >
              {slot.priceDisplay}
            </div>
          </div>
        </Card>

        {/* ── Booking form ───────────────────────────────────────────────── */}
        <BookForm slotId={slot.id} shortCode={slot.shortCode} stylistSlug={row.slug} />

        <div
          style={{
            textAlign: "center",
            marginTop: 32,
            marginBottom: 32,
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
