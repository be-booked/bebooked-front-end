"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, EyebrowLabel } from "@/components/ui";
import { FormError } from "@/components/ui/FormError";
import { PageHeader } from "@/components/PageHeader";
import { createSlotAction } from "../actions";
import { cn } from "@/lib/cn";
import type { ServiceOption } from "../page";

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

const DAYS = getNextDays(5);

const CUTOFF_OPTIONS: { value: string; label: string }[] = [
  { value: "",     label: "No minimum notice" },
  { value: "15",   label: "15 minutes before" },
  { value: "30",   label: "30 minutes before" },
  { value: "60",   label: "1 hour before" },
  { value: "120",  label: "2 hours before" },
  { value: "180",  label: "3 hours before" },
  { value: "240",  label: "4 hours before" },
  { value: "360",  label: "6 hours before" },
];

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

export default function CreateSlotForm({ services }: { services: ServiceOption[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const hasExisting = services.length > 0;
  const [svcValue, setSvcValue] = useState(hasExisting ? "0" : "__new__");
  const isNewService = svcValue === "__new__";
  const chosen = isNewService ? null : services[Number(svcValue)];

  const [newSvcName,  setNewSvcName]  = useState("");
  const [nameError,   setNameError]   = useState<string | undefined>();

  const [day,       setDay]      = useState(DAYS[0].value);
  const [time,      setTime]     = useState("");
  const [timeError, setTimeError] = useState<string | undefined>();
  const [price,     setPrice]    = useState<string>(services[0]?.price?.toString() ?? "");
  const [priceError,setPriceError] = useState<string | undefined>();
  const [mins,      setMins]     = useState<string>(services[0]?.mins?.toString()  ?? "");
  const [minsError, setMinsError] = useState<string | undefined>();
  const [note,   setNote]   = useState("");
  const [cutoff, setCutoff] = useState("");
  const [error,  setError]  = useState<string | null>(null);

  function validateTime(v: string)  { if (!v) return "Time is required"; }
  function validateMins(v: string)  {
    if (!v) return "Duration is required";
    const n = Number(v);
    if (isNaN(n) || n < 15) return "Minimum 15 minutes";
    if (n > 480) return "Maximum 8 hours";
  }
  function validatePrice(v: string) {
    if (v === "") return "Price is required";
    if (Number(v) < 0) return "Price cannot be negative";
  }

  function pickService(val: string) {
    setSvcValue(val);
    setNameError(undefined);
    setMinsError(undefined);
    setPriceError(undefined);
    if (val === "__new__") {
      setNewSvcName("");
      setMins("");
      setPrice("");
    } else {
      const i = Number(val);
      setMins(String(services[i].mins));
      setPrice(String(services[i].price));
    }
  }

  const previewName = isNewService ? (newSvcName.trim() || "New service") : (chosen?.name ?? "");
  const selectedDay  = DAYS.find((d) => d.value === day);
  const selectedTime = TIME_OPTIONS.find((t) => t.value === time);
  const previewWhen  = `${selectedDay?.label ?? ""} · ${selectedTime?.label ?? ""}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const nameErr  = isNewService && !newSvcName.trim() ? "Service name is required" : undefined;
    const timeErr  = validateTime(time);
    const minsErr  = validateMins(mins);
    const priceErr = validatePrice(price);

    setNameError(nameErr);
    setTimeError(timeErr);
    setMinsError(minsErr);
    setPriceError(priceErr);

    if (nameErr || timeErr || minsErr || priceErr) return;

    // Convert the stylist's local date+time to UTC before storing.
    // `new Date("YYYY-MMT HH:MM")` is interpreted as local time by browsers.
    const localDt = new Date(`${day}T${time}`);
    const utcDate = localDt.toISOString().split("T")[0];
    const utcTime = localDt.toISOString().split("T")[1].slice(0, 5);

    const formData = new FormData();
    formData.set("service_name",        isNewService ? newSvcName.trim() : chosen!.name);
    formData.set("slot_date",           utcDate);
    formData.set("slot_time",           utcTime);
    formData.set("duration_mins",       String(mins));
    formData.set("price",               String(price));
    formData.set("note",                note);
    formData.set("booking_cutoff_mins", cutoff);
    if (isNewService) formData.set("save_as_service", "1");

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

  const serviceOptions = [
    ...services.map((s, i) => ({
      value: String(i),
      label: `${s.name} — ${s.mins} min · $${s.price}`,
    })),
    { value: "__new__", label: "＋ Add new service" },
  ];

  return (
    <main className="min-h-screen bg-warm-cream">
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

      <form onSubmit={handleSubmit} className="max-w-[540px] mx-auto px-6 pt-6 pb-[100px]">
        <h1 className="text-2xl font-bold mb-1.5">Post a slot</h1>
        <p className="text-sm text-muted mb-7 leading-relaxed">
          Fill a gap in today&apos;s calendar in seconds.
        </p>

        {/* Service */}
        <div className="mb-4">
          <Select
            label="Service"
            value={svcValue}
            onChange={(e) => pickService(e.target.value)}
            options={serviceOptions}
          />
        </div>

        {/* Service name input — only when adding new */}
        {isNewService && (
          <div className="mb-6">
            <Input
              label="Service name"
              value={newSvcName}
              onChange={(e) => { setNewSvcName(e.target.value); setNameError(undefined); }}
              onBlur={() => { if (!newSvcName.trim()) setNameError("Service name is required"); }}
              placeholder="e.g. Color & cut"
            />
            <FormError message={nameError} className="mt-1" />
          </div>
        )}

        {/* Spacing when existing service selected */}
        {!isNewService && <div className="mb-2" />}

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
        <div className="flex gap-3 mb-1.5">
          <div className="flex-1">
            <Select
              label="Time"
              value={time}
              onChange={(e) => { setTime(e.target.value); setTimeError(undefined); }}
              onBlur={() => setTimeError(validateTime(time))}
              options={[
                { value: "", label: "Select time" },
                ...TIME_OPTIONS,
              ]}
            />
            <FormError message={timeError} className="mt-1" />
          </div>
          <div className="w-[130px]">
            <Input
              label="Length (min)"
              type="number"
              min={15}
              max={480}
              step={15}
              value={mins}
              onChange={(e) => { setMins(e.target.value); setMinsError(undefined); }}
              onBlur={() => setMinsError(validateMins(mins))}
            />
            <FormError message={minsError} className="mt-1" />
          </div>
        </div>

        {/* Price */}
        <div className="mb-6 mt-4">
          <Input
            label="Price"
            type="number"
            min={0}
            step={5}
            prefix="$"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setPriceError(undefined); }}
            onBlur={() => setPriceError(validatePrice(price))}
          />
          <FormError message={priceError} className="mt-1" />
        </div>

        {/* Booking cutoff */}
        <div className="mb-6">
          <Select
            label="Booking cutoff"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
            options={CUTOFF_OPTIONS}
            hint="Stop accepting bookings this far before the slot."
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

        {/* Preview */}
        <div className="mb-7">
          <EyebrowLabel className="block mb-[10px]">Preview</EyebrowLabel>
          <div className="bg-near-black rounded-[22px] p-5 flex justify-between items-start">
            <div>
              <div className="font-bold text-lg text-warm-cream mb-1.5">{previewName}</div>
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
