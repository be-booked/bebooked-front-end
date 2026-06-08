"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, EyebrowLabel } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { createSlotAction } from "./actions";
import { cn } from "@/lib/cn";

// ── Time options every 30 min, 8:00 AM – 8:00 PM ──────────────────────────
const TIME_OPTIONS: { value: string; label: string }[] = (() => {
  const out = [];
  for (let m = 8 * 60; m <= 20 * 60; m += 30) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    const ap = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${h12}:${mm === 0 ? "00" : mm} ${ap}`;
    const value = `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    out.push({ value, label });
  }
  return out;
})();

function getNextDays(count: number): { label: string; value: string }[] {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split("T")[0];
    const label =
      i === 0 ? "Today"
      : i === 1 ? "Tomorrow"
      : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ label, value });
  }
  return days;
}

const DEFAULT_SERVICES = [
  { name: "Cut & Style",     mins: 60,  price: 85  },
  { name: "Highlight + Cut", mins: 150, price: 220 },
  { name: "Root Touch-Up",   mins: 90,  price: 120 },
  { name: "Balayage",        mins: 180, price: 260 },
  { name: "Vivid Color",     mins: 240, price: 320 },
  { name: "Gloss & Blowout", mins: 75,  price: 95  },
];

const DAYS = getNextDays(5);

// ── Chip ───────────────────────────────────────────────────────────────────
function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-[14px] py-2 border-[1.5px] text-[13px] tracking-[0.02em] cursor-pointer whitespace-nowrap transition-all duration-[120ms]",
        active
          ? "border-near-black bg-near-black text-warm-cream font-bold"
          : "border-stone bg-transparent text-near-black font-normal",
      )}
    >
      {children}
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function CreateSlotPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [svcIndex, setSvcIndex] = useState(0);
  const [day, setDay] = useState(DAYS[0].value);
  const [time, setTime] = useState("14:00");
  const [price, setPrice] = useState(DEFAULT_SERVICES[0].price);
  const [mins, setMins] = useState(DEFAULT_SERVICES[0].mins);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const chosen = DEFAULT_SERVICES[svcIndex];

  function pickService(i: number) {
    setSvcIndex(i);
    setPrice(DEFAULT_SERVICES[i].price);
    setMins(DEFAULT_SERVICES[i].mins);
  }

  const selectedDay = DAYS.find((d) => d.value === day);
  const selectedTime = TIME_OPTIONS.find((t) => t.value === time);
  const previewWhen = `${selectedDay?.label ?? ""} · ${selectedTime?.label ?? ""}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("service_name", chosen.name);
    formData.set("slot_date", day);
    formData.set("slot_time", time);
    formData.set("duration_mins", String(mins));
    formData.set("price", String(price));
    formData.set("note", note);

    startTransition(async () => {
      try {
        await createSlotAction(formData);
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  }

  return (
    <main className="min-h-screen bg-warm-cream">
      {/* Header */}
      <PageHeader className="gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-transparent border-none cursor-pointer py-1 text-near-black text-xl leading-none flex items-center"
          aria-label="Go back"
        >
          ←
        </button>
        <EyebrowLabel tone="muted">New opening</EyebrowLabel>
      </PageHeader>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-[540px] mx-auto px-6 pt-6 pb-[100px]">
        <h1 className="text-2xl font-bold mb-1.5">Post a slot</h1>
        <p className="text-sm text-muted mb-7 leading-relaxed">
          Fill a gap in today&apos;s calendar in seconds.
        </p>

        {/* Service */}
        <div className="mb-6">
          <Select
            label="Service"
            value={String(svcIndex)}
            onChange={(e) => pickService(Number(e.target.value))}
            options={DEFAULT_SERVICES.map((s, i) => ({
              value: String(i),
              label: `${s.name} — ${s.mins} min · $${s.price}`,
            }))}
          />
        </div>

        {/* Day chips */}
        <div className="mb-6">
          <EyebrowLabel className="block mb-[10px]">Day</EyebrowLabel>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <Chip key={d.value} active={day === d.value} onClick={() => setDay(d.value)}>
                {d.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Time + Length */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1">
            <Select label="Time" value={time} onChange={(e) => setTime(e.target.value)} options={TIME_OPTIONS} />
          </div>
          <div className="w-[130px]">
            <Input
              label="Length (min)"
              type="number"
              min={15}
              max={480}
              step={15}
              value={mins}
              onChange={(e) => setMins(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <Input
            label="Price"
            type="number"
            min={0}
            step={5}
            prefix="$"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        {/* Note */}
        <div className="mb-7">
          <Input
            label="Note (optional)"
            placeholder="e.g. Parking is in the back lot"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Shown to clients on the booking page"
          />
        </div>

        {/* Preview card */}
        <div className="mb-7">
          <EyebrowLabel className="block mb-[10px]">Preview</EyebrowLabel>
          <div className="bg-near-black rounded-[22px] p-5 flex justify-between items-start">
            <div>
              <div className="font-bold text-lg text-warm-cream mb-1.5">{chosen.name}</div>
              <div className="text-[13px] text-stone mb-[3px]">{previewWhen}</div>
              <div className="text-[13px] text-stone">{mins} min</div>
            </div>
            <div className="font-bold text-xl text-warm-cream shrink-0 ml-4">${price}</div>
          </div>
        </div>

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
          {isPending ? "Posting…" : "Post & get link"}
        </Button>
      </form>
    </main>
  );
}
