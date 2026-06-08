"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, EyebrowLabel } from "@/components/ui";
import { createSlotAction } from "./actions";

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

// ── Day chips ──────────────────────────────────────────────────────────────
function getNextDays(count: number): { label: string; value: string }[] {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const label =
      i === 0
        ? "Today"
        : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ label, value });
  }
  return days;
}

// ── Default services (shown when stylist has no services in DB yet) ─────────
const DEFAULT_SERVICES = [
  { name: "Cut & Style",       mins: 60,  price: 85  },
  { name: "Highlight + Cut",   mins: 150, price: 220 },
  { name: "Root Touch-Up",     mins: 90,  price: 120 },
  { name: "Balayage",          mins: 180, price: 260 },
  { name: "Vivid Color",       mins: 240, price: 320 },
  { name: "Gloss & Blowout",   mins: 75,  price: 95  },
];

const DAYS = getNextDays(5);

// ── Chip ───────────────────────────────────────────────────────────────────
function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "8px 14px",
        border: `1.5px solid ${active ? "var(--near-black)" : "var(--stone)"}`,
        background: active ? "var(--near-black)" : "transparent",
        color: active ? "var(--warm-cream)" : "var(--text-primary)",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        fontWeight: active ? "var(--weight-bold)" : "var(--weight-regular)",
        letterSpacing: "0.02em",
        cursor: "pointer",
        borderRadius: 0,
        transition: "all var(--dur-fast) var(--ease-standard)",
        whiteSpace: "nowrap",
      }}
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

  // Format preview
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
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--hairline)",
          padding: "14px var(--gutter)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
            color: "var(--text-primary)",
            fontFamily: "var(--font-sans)",
            fontSize: "20px",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
          }}
          aria-label="Go back"
        >
          ←
        </button>
        <EyebrowLabel tone="muted">New opening</EyebrowLabel>
      </header>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "24px var(--gutter) 100px",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            marginBottom: 6,
          }}
        >
          Post a slot
        </h1>
        <p
          style={{
            fontSize: "var(--size-small)",
            color: "var(--text-muted)",
            marginBottom: 28,
            lineHeight: 1.5,
          }}
        >
          Fill a gap in today&apos;s calendar in seconds.
        </p>

        {/* Service */}
        <div style={{ marginBottom: 24 }}>
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
        <div style={{ marginBottom: 24 }}>
          <EyebrowLabel style={{ marginBottom: 10, display: "block" }}>Day</EyebrowLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {DAYS.map((d) => (
              <Chip key={d.value} active={day === d.value} onClick={() => setDay(d.value)}>
                {d.label}
              </Chip>
            ))}
          </div>
        </div>

        {/* Time + Length row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <Select
              label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              options={TIME_OPTIONS}
            />
          </div>
          <div style={{ width: 130 }}>
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
        <div style={{ marginBottom: 24 }}>
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

        {/* Note (optional) */}
        <div style={{ marginBottom: 28 }}>
          <Input
            label="Note (optional)"
            placeholder="e.g. Parking is in the back lot"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Shown to clients on the booking page"
          />
        </div>

        {/* Preview card */}
        <div style={{ marginBottom: 28 }}>
          <EyebrowLabel style={{ marginBottom: 10, display: "block" }}>Preview</EyebrowLabel>
          <div
            style={{
              background: "var(--near-black)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
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
                  color: "var(--warm-cream)",
                  marginBottom: 6,
                }}
              >
                {chosen.name}
              </div>
              <div style={{ fontSize: "13px", color: "var(--stone)", marginBottom: 3 }}>
                {previewWhen}
              </div>
              <div style={{ fontSize: "13px", color: "var(--stone)" }}>{mins} min</div>
            </div>
            <div
              style={{
                fontWeight: "var(--weight-bold)",
                fontSize: "20px",
                color: "var(--warm-cream)",
                flexShrink: 0,
                marginLeft: 16,
              }}
            >
              ${price}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p
            style={{
              color: "var(--danger)",
              fontSize: "var(--size-small)",
              marginBottom: 16,
            }}
          >
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          style={{ width: "100%" }}
          disabled={isPending}
        >
          {isPending ? "Posting…" : "Post & get link"}
        </Button>
      </form>
    </main>
  );
}
