import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, EyebrowLabel, Card } from "@/components/ui";
import { PoweredBy } from "@/components/PoweredBy";
import { formatPrice, formatAddress } from "@/lib/format";
import { LocalSlotTime } from "@/components/LocalSlotTime";
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

  // Slot no longer available
  if (row.status !== "open") {
    return (
      <main className="min-h-screen bg-warm-cream flex items-center justify-center p-6">
        <div className="text-center max-w-[320px]">
          <div className="text-[36px] mb-4">🔒</div>
          <h1 className="text-[28px] font-bold mb-2">Slot no longer available</h1>
          <p className="text-sm text-muted mb-6 leading-relaxed">
            This opening has already been booked. Check back for new slots.
          </p>
          <Link href={`/${row.slug}`} className="text-sm text-sage underline">
            See other openings
          </Link>
        </div>
      </main>
    );
  }

  // Booking cutoff enforcement — slot times are stored as UTC, so add Z suffix
  if (row.bookingCutoffMins !== null && row.bookingCutoffMins !== undefined) {
    const slotDateTime = new Date(`${row.slotDate}T${row.slotTime}Z`);
    const cutoffAt = new Date(slotDateTime.getTime() - row.bookingCutoffMins * 60 * 1000);
    if (new Date() >= cutoffAt) {
      return (
        <main className="min-h-screen bg-warm-cream flex items-center justify-center p-6">
          <div className="text-center max-w-[320px]">
            <div className="text-[36px] mb-4">⏰</div>
            <h1 className="text-[28px] font-bold mb-2">Booking window closed</h1>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Bookings closed for this slot. Check back for new openings.
            </p>
            <Link href={`/${row.slug}`} className="text-sm text-sage underline">
              See other openings
            </Link>
          </div>
        </main>
      );
    }
  }

  const slot = {
    id:           row.id,
    name:         row.serviceName,
    slotDate:     row.slotDate,
    slotTime:     row.slotTime,
    mins:         row.durationMins,
    priceDisplay: formatPrice(row.priceCents),
    shortCode:    row.shortCode,
  };

  const meta = [row.studio, formatAddress(row.addressStreet, row.addressCity, row.addressState, row.addressZip)].filter(Boolean).join(" · ");

  return (
    <main className="min-h-screen bg-warm-cream">
      <div className="max-w-[420px] mx-auto px-6">
        {/* Header */}
        <header className="flex items-center justify-between py-[14px] mb-1.5">
          <Link
            href={`/${row.slug}`}
            aria-label="Back"
            className="flex items-center justify-center size-[34px] text-near-black no-underline text-xl"
          >
            ←
          </Link>
          <EyebrowLabel tone="muted">Booking</EyebrowLabel>
          <span className="size-[34px]" />
        </header>

        {/* Stylist */}
        <div className="flex items-center gap-[13px] my-1.5 mb-[22px]">
          <Avatar name={row.stylistName} src={row.photoUrl ?? undefined} size={52} />
          <div>
            <div className="font-bold text-[17px] mb-0.5">{row.stylistName}</div>
            {meta && <div className="text-sm text-muted whitespace-nowrap">{meta}</div>}
          </div>
        </div>

        {/* Slot detail */}
        <EyebrowLabel tone="accent" className="block mb-[10px]">Last-minute opening</EyebrowLabel>

        <Card variant="inverse" radius="lg" padding="22px" className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-lg text-warm-cream mb-2">{slot.name}</div>
              <div className="text-sm text-warm-cream/65 mb-1">📅 <LocalSlotTime utcDate={slot.slotDate} utcTime={slot.slotTime} /></div>
              <div className="text-sm text-warm-cream/65">⏱ {slot.mins} min</div>
            </div>
            <div className="font-bold text-[22px] text-warm-cream">{slot.priceDisplay}</div>
          </div>
        </Card>

        {/* Cancellation policy */}
        {row.cancellationPolicy && (
          <div className="bg-linen border border-hairline px-4 py-3 mb-6">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted mb-1">Cancellation policy</p>
            <p className="text-sm text-near-black leading-relaxed">{row.cancellationPolicy}</p>
          </div>
        )}

        {/* Booking form */}
        <BookForm slotId={slot.id} shortCode={slot.shortCode} stylistSlug={row.slug} />

        <PoweredBy className="mt-8 mb-8" />
      </div>
    </main>
  );
}
