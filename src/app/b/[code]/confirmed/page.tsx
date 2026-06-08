import { notFound } from "next/navigation";
import { Avatar, EyebrowLabel, Card, ButtonLink } from "@/components/ui";
import { PoweredBy } from "@/components/PoweredBy";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getBookingDetails } from "@/lib/db/repositories/bookings";

// ── Recap row ──────────────────────────────────────────────────────────────

function RecapRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-[9px] border-b border-hairline">
      <span className="text-sm w-5 text-center shrink-0">{icon}</span>
      <span className="text-sm text-muted flex-[0_0_60px]">{label}</span>
      <span className="text-sm font-medium flex-1">{value}</span>
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
    <main className="min-h-screen bg-warm-cream flex flex-col">
      <div className="max-w-[420px] mx-auto px-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Success indicator */}
          <div className="flex flex-col items-center text-center my-9 mb-7">
            <div className="size-16 rounded-full border-[2.5px] border-sage flex items-center justify-center text-[26px] text-sage">
              ✓
            </div>
            <h1 className="text-[28px] font-bold mt-[18px] mb-1.5">You&apos;re booked.</h1>
            <p className="text-sm text-muted max-w-[280px] leading-relaxed">
              We&apos;ve texted your confirmation to +1 {maskedPhone}.
            </p>
          </div>

          {/* Recap card */}
          <Card variant="linen" radius="md" padding="20px">
            {/* Stylist row */}
            <div className="flex items-center gap-3 pb-4 border-b border-hairline mb-1">
              <Avatar name={row.stylistName} src={row.photoUrl ?? undefined} size={40} />
              <div>
                <div className="font-bold text-sm mb-0.5">{row.stylistName}</div>
                {row.studio && <div className="text-xs text-muted">{row.studio}</div>}
              </div>
            </div>

            <RecapRow icon="✂" label="Service" value={row.serviceName} />
            <RecapRow icon="📅" label="When"    value={when} />
            <RecapRow icon="⏱"  label="Length"  value={`${row.durationMins} min`} />
            {row.location && <RecapRow icon="📍" label="Where" value={row.location} />}
            <RecapRow icon="$"  label="Price"   value={priceDisplay} />
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2.5 mt-4">
            {/* Add to calendar — placeholder until calendar integration is wired up */}
            <span className="flex-1 inline-flex items-center justify-center gap-2 py-[13px] px-4 text-sm font-bold tracking-[0.04em] leading-none border-regular border-stone bg-transparent text-near-black cursor-default opacity-45">
              📅 Add to calendar
            </span>
            <ButtonLink
              href={`/${row.slug}`}
              variant="secondary"
              size="md"
              className="flex-1"
            >
              ← More slots
            </ButtonLink>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 mb-8">
          <EyebrowLabel tone="muted" className="block mb-[14px]">
            Beauty, on your schedule
          </EyebrowLabel>
          <PoweredBy />
        </div>
      </div>
    </main>
  );
}
