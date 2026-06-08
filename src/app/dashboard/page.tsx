import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { Button, ButtonLink, EyebrowLabel } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import SlotCard, { type SlotCardData } from "./_components/SlotCard";
import NavAvatar from "./_components/NavAvatar";
import { formatSlotWhen, formatPrice } from "@/lib/format";
import { getStylistByClerkId } from "@/lib/db/repositories/stylists";
import { getOpenSlotsByStylistId } from "@/lib/db/repositories/slots";
import { cn } from "@/lib/cn";

export default async function DashboardPage() {
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
    <main className="min-h-screen bg-warm-cream">
      {/* Header */}
      <PageHeader className="justify-between">
        <Wordmark size="sm" />
        <NavAvatar name={stylistName} src={stylist?.photoUrl ?? undefined} size={34} />
      </PageHeader>

      {/* Body */}
      <div className="max-w-[680px] mx-auto px-6 pt-6 pb-16">
        {/* Title row */}
        <div className="flex justify-between items-end mb-1">
          <h1 className="text-[28px] font-bold leading-[1.1] m-0">My slots</h1>
          <EyebrowLabel tone="muted" className="mb-1">
            {stylist?.location ?? ""}
          </EyebrowLabel>
        </div>

        {/* Subtitle */}
        <p className="text-sm text-muted mb-5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-block size-2 rounded-full shrink-0",
              slots.length > 0 ? "bg-sage" : "bg-stone",
            )}
          />
          {dbError
            ? "Database not connected yet"
            : slots.length === 0
            ? "No open slots · post one to get started"
            : `${slots.length} open slot${slots.length === 1 ? "" : "s"} · share to fill them`}
        </p>

        {/* Action row */}
        <div className="flex gap-2.5 mb-6">
          <Link href="/dashboard/create" className="flex-1 no-underline">
            <Button variant="primary" fullWidth>+ Post a new slot</Button>
          </Link>
          <ButtonLink
            href={stylist?.slug ? `https://bebookedtoday.com/${stylist.slug}` : "#"}
            target={stylist?.slug ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label="View your public profile"
            className="shrink-0"
          >
            Share profile
          </ButtonLink>
        </div>

        {/* Slot list / empty */}
        {slotsError && (
          <p className="text-sm text-danger bg-danger/8 border border-danger/25 px-4 py-3 mb-4 leading-relaxed">
            <strong>Slots query error:</strong> {slotsError}
          </p>
        )}
        {slots.length === 0 && !slotsError && <EmptyState dbError={dbError} />}
        {slots.length > 0 && (
          <div className="flex flex-col gap-3" role="list" aria-label="Your open slots">
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

// ── Empty states ───────────────────────────────────────────────────────────

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
        ✂️
      </div>
      <p className="font-bold text-base text-near-black m-0 mb-2">No open slots yet</p>
      <p className="text-sm text-muted leading-relaxed max-w-[280px] mx-auto mb-6">
        Post your first opening and share the link to get booked in minutes.
      </p>
      <Link href="/dashboard/create" className="no-underline">
        <Button variant="accent" size="sm">Post your first slot</Button>
      </Link>
    </div>
  );
}
