import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { Button, ButtonLink, EyebrowLabel, Card } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import SlotCard, { type SlotCardData } from "./_components/SlotCard";
import BookedSlotCard, { type BookedSlotCardData } from "./_components/BookedSlotCard";
import { formatPrice, formatCityState } from "@/lib/format";
import { LocalSlotTime } from "@/components/LocalSlotTime";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import {
  getActiveSlotsForDashboard,
  getHistorySlotsForDashboard,
  getSlotFillRate,
} from "@/lib/db/repositories/slots";
import { cn } from "@/lib/cn";

// ── History slot card (server component — no client state needed) ───────────

type HistorySlotData = {
  id: number;
  name: string;
  slotDate: string;  // UTC "YYYY-MM-DD"
  slotTime: string;  // UTC "HH:MM"
  mins: number;
  priceDisplay: string;
  status: "open" | "booked" | "cancelled";
  clientName: string | null;
};

function HistorySlotCard({ slot }: { slot: HistorySlotData }) {
  const statusLabel =
    slot.status === "booked"      ? "Booked"
    : slot.status === "cancelled" ? "Cancelled"
    : "Unfilled";

  const statusBadgeClass =
    slot.status === "booked"
      ? "bg-sage-soft text-sage"
      : "bg-stone/40 text-muted";

  return (
    <Card variant="linen" radius="md" padding="18px" className="flex flex-col gap-3">
      {/* Service + price */}
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-base text-muted mb-1">{slot.name}</div>
          <div className="text-sm text-warm-gray flex items-center gap-[5px]">
            <LocalSlotTime utcDate={slot.slotDate} utcTime={slot.slotTime} /> · {slot.mins} min
            {slot.clientName ? ` · ${slot.clientName}` : ""}
          </div>
        </div>
        <div className="font-bold text-base text-muted shrink-0 ml-3">{slot.priceDisplay}</div>
      </div>
      {/* Status badge */}
      <div>
        <span className={cn(
          "inline-flex items-center px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase",
          statusBadgeClass,
        )}>
          {statusLabel}
        </span>
      </div>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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

  const { tab = "active" } = await searchParams;
  const isHistory = tab === "history";

  const openSlots:    SlotCardData[]       = [];
  const bookedSlots:  BookedSlotCardData[] = [];
  let historySlots: HistorySlotData[]    = [];
  let fillRate:     { total: number; booked: number } = { total: 0, booked: 0 };
  let slotsError:   string | null        = null;

  if (!dbError && stylist) {
    try {
      fillRate = await getSlotFillRate(stylist.id);
    } catch {
      // non-critical — don't block the page
    }
    try {
      if (isHistory) {
        const rows = await getHistorySlotsForDashboard(stylist.id);
        historySlots = rows.map((r) => ({
          id:           r.id,
          name:         r.serviceName,
          slotDate:     r.slotDate,
          slotTime:     r.slotTime,
          mins:         r.durationMins,
          priceDisplay: formatPrice(r.priceCents),
          status:       r.status,
          clientName:   r.clientName ?? null,
        }));
      } else {
        const rows = await getActiveSlotsForDashboard(stylist.id);
        for (const r of rows) {
          if (r.status === "open") {
            openSlots.push({
              id:           r.id,
              name:         r.serviceName,
              slotDate:     r.slotDate,
              slotTime:     r.slotTime,
              mins:         r.durationMins,
              priceDisplay: formatPrice(r.priceCents),
              shortCode:    r.shortCode,
            });
          } else {
            bookedSlots.push({
              id:           r.id,
              name:         r.serviceName,
              slotDate:     r.slotDate,
              slotTime:     r.slotTime,
              mins:         r.durationMins,
              priceDisplay: formatPrice(r.priceCents),
              clientName:   r.clientName ?? null,
              clientPhone:  r.clientPhone ?? null,
            });
          }
        }
      }
    } catch (err) {
      slotsError = err instanceof Error ? err.message : String(err);
      console.error("[dashboard] slots query failed:", slotsError);
    }
  }

  const hasActive = openSlots.length > 0 || bookedSlots.length > 0;

  const activeSubtitle = (() => {
    if (dbError) return "Database not connected yet";
    if (!hasActive) return "No open slots · post one to get started";
    if (openSlots.length === 0) return `${bookedSlots.length} appointment${bookedSlots.length === 1 ? "" : "s"} booked`;
    if (bookedSlots.length === 0) return `${openSlots.length} open slot${openSlots.length === 1 ? "" : "s"} · share to fill them`;
    return `${openSlots.length} open · ${bookedSlots.length} booked`;
  })();

  return (
    <main className="min-h-screen bg-warm-cream">
      {/* Header */}
      <PageHeader className="justify-between">
        <Wordmark size="sm" />
      </PageHeader>

      {/* Body */}
      <div className="max-w-[680px] mx-auto px-6 pt-6 pb-16">
        {/* Title row */}
        <div className="flex justify-between items-end mb-1">
          <h1 className="text-[28px] font-bold leading-[1.1] m-0">My slots</h1>
          <EyebrowLabel tone="muted" className="mb-1">
            {formatCityState(stylist?.addressCity, stylist?.addressState)}
          </EyebrowLabel>
        </div>

        {/* Subtitle — always visible so layout stays stable across tabs */}
        <p className="text-sm text-muted mb-5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block size-2 rounded-full shrink-0",
              !isHistory && openSlots.length > 0 ? "bg-sage" : "bg-stone",
            )}
          />
          {isHistory
            ? `${historySlots.length} past slot${historySlots.length === 1 ? "" : "s"}`
            : activeSubtitle}
        </p>

        {/* Action row */}
        <div className="flex gap-2.5 mb-5">
          <ButtonLink href="/dashboard/create" variant="primary" fullWidth>
            + Create slot
          </ButtonLink>
          <ButtonLink
            href={stylist?.slug ? `/${stylist.slug}` : "#"}
            aria-label="View your public profile"
            fullWidth
          >
            Profile
          </ButtonLink>
        </div>

        {/* Fill rate stat */}
        {fillRate.total > 0 && (() => {
          const pct = Math.round((fillRate.booked / fillRate.total) * 100);
          return (
            <div className="flex items-center justify-between bg-warm-linen px-4 py-2.5 rounded-[8px] mb-5">
              <span className="text-xs text-muted font-semibold tracking-[0.06em] uppercase">Fill rate</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-near-black">{pct}%</span>
                <span className="text-xs text-muted">{fillRate.booked} of {fillRate.total} past slots</span>
              </div>
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex border-b border-hairline mb-5">
          <Link
            href="/dashboard"
            className={cn(
              "text-sm font-semibold pb-[10px] mr-6 border-b-2 -mb-[1px] no-underline transition-colors",
              !isHistory
                ? "border-near-black text-near-black"
                : "border-transparent text-muted hover:text-near-black",
            )}
          >
            Active
          </Link>
          <Link
            href="/dashboard?tab=history"
            className={cn(
              "text-sm font-semibold pb-[10px] border-b-2 -mb-[1px] no-underline transition-colors",
              isHistory
                ? "border-near-black text-near-black"
                : "border-transparent text-muted hover:text-near-black",
            )}
          >
            History
          </Link>
        </div>

        {/* ── Active tab ── */}
        {!isHistory && (
          <>
            {slotsError && (
              <p className="text-sm text-danger bg-danger/8 border border-danger/25 px-4 py-3 mb-4 leading-relaxed">
                <strong>Slots query error:</strong> {slotsError}
              </p>
            )}

            {!hasActive && !slotsError && <EmptyState dbError={dbError} />}

            {/* Open slots — with share links */}
            {openSlots.length > 0 && (
              <>
                {bookedSlots.length > 0 && (
                  <EyebrowLabel className="block mb-[10px]">
                    <span className="inline-block size-2 rounded-full mr-1.5 align-middle bg-stone" />
                    Open slots
                  </EyebrowLabel>
                )}
                <div
                  className={cn("flex flex-col gap-3", bookedSlots.length > 0 && "mb-7")}
                  role="list"
                  aria-label="Your open slots"
                >
                  {openSlots.map((s) => (
                    <div key={s.id} role="listitem">
                      <SlotCard slot={s} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Booked appointments */}
            {bookedSlots.length > 0 && (
              <>
                <EyebrowLabel className="block mb-[10px]">
                  <span className="inline-block size-2 rounded-full mr-1.5 align-middle bg-sage" />
                  Booked appointments
                </EyebrowLabel>
                <div className="flex flex-col gap-3" role="list">
                  {bookedSlots.map((s) => (
                    <div key={s.id} role="listitem">
                      <BookedSlotCard slot={s} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── History tab ── */}
        {isHistory && (
          <>
            {slotsError && (
              <p className="text-sm text-danger bg-danger/8 border border-danger/25 px-4 py-3 mb-4 leading-relaxed">
                <strong>Slots query error:</strong> {slotsError}
              </p>
            )}

            {historySlots.length === 0 && !slotsError && (
              <div className="text-center px-6 py-14 text-muted">
                <p className="text-sm leading-relaxed">No past slots yet.</p>
              </div>
            )}

            {historySlots.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {historySlots.map((s) => (
                  <HistorySlotCard key={s.id} slot={s} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ dbError }: { dbError: boolean }) {
  if (dbError) {
    return (
      <div className="text-center px-6 py-12 text-muted">
        <p className="text-sm leading-relaxed max-w-[320px] mx-auto">
          Database isn&apos;t connected yet. Add your{" "}
          <code className="font-mono bg-warm-linen px-[5px] py-[1px] rounded-[2px]">
            DATABASE_URL
          </code>{" "}
          to <code className="font-mono">.env.local</code> and run the setup SQL in Neon.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center px-6 py-14 text-muted">
      <div
        className="size-14 rounded-[12px] bg-stone mx-auto mb-5 flex items-center justify-center text-[22px]"
        aria-hidden="true"
      >
        🌸
      </div>
      <p className="font-bold text-base text-near-black m-0 mb-2">No open slots yet</p>
      <p className="text-sm text-muted leading-relaxed max-w-[280px] mx-auto mb-6">
        Post your first opening and share the link to get booked in minutes.
      </p>
      <Link href="/dashboard/create" className="no-underline">
        <Button variant="accent" size="sm">Post a slot</Button>
      </Link>
    </div>
  );
}
