import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { Avatar, EyebrowLabel, Card, Button } from "@/components/ui";
import { PoweredBy } from "@/components/PoweredBy";
import { ShareProfileButton } from "./_components/ShareProfileButton";
import { AboutStylist } from "./_components/AboutStylist";
import { formatPrice, formatCityState, formatAddress } from "@/lib/format";
import { LocalSlotTime } from "@/components/LocalSlotTime";
import { auth } from "@clerk/nextjs/server";
import { getStylistBySlug } from "@/lib/db/repositories/stylists";
import { getAllPublicSlotsBySlug } from "@/lib/db/repositories/slots";
import { APP_URL } from "@/lib/url";
import { cn } from "@/lib/cn";

interface PublicSlot {
  id: number;
  shortCode: string;
  name: string;
  slotDate: string;  // UTC "YYYY-MM-DD"
  slotTime: string;  // UTC "HH:MM"
  mins: number;
  priceDisplay: string;
}

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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [stylist, { userId }] = await Promise.all([
    getStylistBySlug(slug),
    auth(),
  ]);
  if (!stylist) notFound();

  const isOwner = !!userId && userId === stylist.clerkUserId;

  const slotRows = await getAllPublicSlotsBySlug(slug);

  function mapSlot(r: (typeof slotRows)[number]): PublicSlot {
    return {
      id:           r.id,
      shortCode:    r.shortCode,
      name:         r.serviceName,
      slotDate:     r.slotDate,
      slotTime:     r.slotTime,
      mins:         r.durationMins,
      priceDisplay: formatPrice(r.priceCents),
    };
  }

  const openSlots   = slotRows.filter((r) => r.status === "open").map(mapSlot);
  const bookedSlots = slotRows.filter((r) => r.status === "booked").map(mapSlot);
  const hasAnySlots = openSlots.length > 0 || bookedSlots.length > 0;

  const meta = [stylist.studio, formatCityState(stylist.addressCity, stylist.addressState)].filter(Boolean).join(" · ");

  return (
    <main className="min-h-screen bg-warm-cream">
      {/* Owner-only: back to dashboard bar */}
      {isOwner && (
        <div className="bg-near-black text-warm-cream px-6 py-2.5 flex items-center justify-between text-sm">
          <span className="text-warm-cream/60 text-xs tracking-wide uppercase font-semibold">Your public profile</span>
          <Link href="/dashboard" className="text-warm-cream no-underline font-semibold text-xs flex items-center gap-1.5 hover:opacity-80 transition-opacity">
            ← Dashboard
          </Link>
        </div>
      )}

      {/* Profile hero */}
      <div className="bg-warm-cream border-b border-hairline px-6 pt-8 pb-6">
        <div className="max-w-[420px] mx-auto">
          <div className="flex items-start gap-4">
            <Avatar name={stylist.name} src={stylist.photoUrl ?? undefined} size={64} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h1 className="text-[22px] font-bold leading-[1.2]">{stylist.name}</h1>
                <ShareProfileButton
                  name={stylist.name}
                  url={`${APP_URL}/${stylist.slug}`}
                />
              </div>
              {meta && <div className="text-sm text-muted">{meta}</div>}
              <AboutStylist
                name={stylist.name}
                meta={meta}
                photoUrl={stylist.photoUrl}
                bio={stylist.bio}
                specialties={stylist.specialties ?? []}
                address={formatAddress(
                  stylist.addressStreet,
                  stylist.addressCity,
                  stylist.addressState,
                  stylist.addressZip,
                )}
                cancellationPolicy={stylist.cancellationPolicy}
                hasPhone={!!stylist.phone}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="max-w-[420px] mx-auto px-6 pt-6 pb-16">

        {/* ── Open slots ── */}
        <div className="flex justify-between items-center mb-[14px]">
          <EyebrowLabel>
            <span
              className={cn(
                "inline-block size-2 rounded-full mr-1.5 align-middle",
                openSlots.length > 0 ? "bg-sage" : "bg-stone",
              )}
            />
            Open slots
          </EyebrowLabel>
          <span className="text-xs text-muted font-medium">{openSlots.length} available</span>
        </div>

        {/* No slots at all → full empty state */}
        {!hasAnySlots && (
          <div className="text-center px-6 py-14 text-muted">
            <p className="text-sm leading-relaxed">No open slots right now. Check back soon.</p>
          </div>
        )}

        {/* No open slots but booked slots exist → compact note */}
        {hasAnySlots && openSlots.length === 0 && (
          <p className="text-sm text-muted py-3 mb-2">No openings right now — check back soon.</p>
        )}

        {/* Open slot cards */}
        {openSlots.length > 0 && (
          <div className="flex flex-col gap-3" role="list">
            {openSlots.map((slot) => (
              <div key={slot.id} role="listitem">
                <SlotCard slot={slot} />
              </div>
            ))}
          </div>
        )}

        {/* ── Recently booked ── */}
        {bookedSlots.length > 0 && (
          <>
            <div className="flex justify-between items-center mt-8 mb-[14px]">
              <EyebrowLabel>
                <span className="inline-block size-2 rounded-full mr-1.5 align-middle bg-stone" />
                Booked
              </EyebrowLabel>
              <span className="text-xs text-muted font-medium">{bookedSlots.length} booked</span>
            </div>
            <div className="flex flex-col gap-3" role="list">
              {bookedSlots.map((slot) => (
                <div key={slot.id} role="listitem">
                  <BookedSlotCard slot={slot} />
                </div>
              ))}
            </div>
          </>
        )}

        <PoweredBy className="mt-12" />
      </div>
    </main>
  );
}

// ── Open slot card ─────────────────────────────────────────────────────────

function SlotCard({ slot }: { slot: PublicSlot }) {
  return (
    <Card variant="raised" radius="md" padding="18px">
      <div className="flex justify-between items-start mb-[14px]">
        <div>
          <div className="font-bold text-base mb-1">{slot.name}</div>
          <div className="text-sm text-muted flex items-center gap-1.5">
            <Calendar size={13} strokeWidth={2} className="shrink-0 text-muted" />
            <LocalSlotTime utcDate={slot.slotDate} utcTime={slot.slotTime} /> · {slot.mins} min
          </div>
        </div>
        <div className="font-bold text-base">{slot.priceDisplay}</div>
      </div>
      <Link href={`/b/${slot.shortCode}`} className="block no-underline">
        <Button variant="accent" size="sm" fullWidth>Book this slot</Button>
      </Link>
    </Card>
  );
}

// ── Booked slot card ───────────────────────────────────────────────────────

function BookedSlotCard({ slot }: { slot: PublicSlot }) {
  return (
    <Card variant="linen" radius="md" padding="18px">
      <div className="flex justify-between items-start mb-[14px]">
        <div>
          <div className="font-bold text-base text-muted mb-1">{slot.name}</div>
          <div className="text-sm text-muted flex items-center gap-1.5">
            <Calendar size={13} strokeWidth={2} className="shrink-0 text-muted" />
            <LocalSlotTime utcDate={slot.slotDate} utcTime={slot.slotTime} /> · {slot.mins} min
          </div>
        </div>
        <div className="font-bold text-base text-muted">{slot.priceDisplay}</div>
      </div>
      <div>
        <span className="inline-flex items-center px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase bg-stone/50 text-muted">
          Booked
        </span>
      </div>
    </Card>
  );
}
