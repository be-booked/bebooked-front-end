import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, EyebrowLabel, Card } from "@/components/ui";
import Wordmark from "@/components/Wordmark";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getBookingDetails } from "@/lib/db/repositories/bookings";

// ── Recap row ──────────────────────────────────────────────────────────────

function RecapRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 0",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <span style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span
        style={{
          fontSize: "var(--size-small)",
          color: "var(--text-muted)",
          flex: "0 0 60px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--size-small)",
          color: "var(--text-primary)",
          fontWeight: "var(--weight-medium)",
          flex: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function ConfirmedPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const row = await getBookingDetails(code);
  if (!row) notFound();

  const when         = formatSlotWhen(row.slotDate, row.slotTime);
  const priceDisplay = formatPrice(row.priceCents);
  const maskedPhone  = row.clientPhone.replace(/\d(?=\d{4})/g, "•");

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: "var(--app-max)",
          margin: "0 auto",
          padding: "0 var(--gutter)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {/* ── Success indicator ──────────────────────────────────────── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              margin: "36px 0 28px",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-pill)",
                border: "2.5px solid var(--sage)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                color: "var(--sage)",
              }}
            >
              ✓
            </div>
            <h1
              style={{
                fontSize: "var(--size-title)",
                fontWeight: "var(--weight-bold)",
                color: "var(--text-primary)",
                marginTop: 18,
                marginBottom: 6,
              }}
            >
              You&apos;re booked.
            </h1>
            <p
              style={{
                fontSize: "var(--size-small)",
                color: "var(--text-muted)",
                maxWidth: 280,
                lineHeight: 1.6,
              }}
            >
              We&apos;ve texted your confirmation to +1 {maskedPhone}.
            </p>
          </div>

          {/* ── Recap card ─────────────────────────────────────────────── */}
          <Card variant="linen" radius="md" padding="20px">
            {/* Stylist row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                paddingBottom: 16,
                borderBottom: "1px solid var(--hairline)",
                marginBottom: 4,
              }}
            >
              <Avatar name={row.stylistName} src={row.photoUrl ?? undefined} size={40} />
              <div>
                <div
                  style={{
                    fontWeight: "var(--weight-bold)",
                    fontSize: "var(--size-small)",
                    color: "var(--text-primary)",
                    marginBottom: 2,
                  }}
                >
                  {row.stylistName}
                </div>
                {row.studio && (
                  <div style={{ fontSize: "var(--size-caption)", color: "var(--text-muted)" }}>
                    {row.studio}
                  </div>
                )}
              </div>
            </div>

            <RecapRow icon="✂" label="Service" value={row.serviceName} />
            <RecapRow icon="📅" label="When"    value={when} />
            <RecapRow icon="⏱"  label="Length"  value={`${row.durationMins} min`} />
            {row.location && (
              <RecapRow icon="📍" label="Where" value={row.location} />
            )}
            <RecapRow icon="$"  label="Price"   value={priceDisplay} />
          </Card>

          {/* ── Action buttons ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <span
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px 16px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: "var(--weight-bold)",
                letterSpacing: "0.04em",
                lineHeight: 1,
                border: "1.5px solid var(--border-default)",
                background: "transparent",
                color: "var(--text-primary)",
                cursor: "default",
              }}
            >
              📅 Add to calendar
            </span>
            <Link
              href={`/${row.slug}`}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "13px 16px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                fontWeight: "var(--weight-bold)",
                letterSpacing: "0.04em",
                lineHeight: 1,
                border: "1.5px solid var(--border-default)",
                background: "transparent",
                color: "var(--text-primary)",
                textDecoration: "none",
              }}
            >
              ← More slots
            </Link>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginTop: 40, marginBottom: 32 }}>
          <EyebrowLabel tone="muted" style={{ marginBottom: 14, display: "block" }}>
            Beauty, on your schedule
          </EyebrowLabel>
          <div style={{ fontSize: "var(--size-caption)", color: "var(--text-muted)" }}>
            Powered by{" "}
            <Wordmark size="sm" style={{ fontSize: 14, verticalAlign: "middle" }} />
          </div>
        </div>
      </div>
    </main>
  );
}
