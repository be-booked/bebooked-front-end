"use client";

import { useRef, useState, useTransition } from "react";
import { Button, Input, EyebrowLabel, Card, IconButton, FormError } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { ServiceListItem } from "@/components/ServiceListItem";
import { AddServiceButton } from "@/components/AddServiceButton";
import { ProfileFields, type ProfileFieldsHandle } from "@/app/dashboard/_components/ProfileFields";
import { saveSetup, type ServiceDraft } from "./actions";

// ── Add service inline form ────────────────────────────────────────────────

type ServiceFieldErrors = Partial<Record<"name" | "mins" | "price", string>>;

function validateServiceName(v: string): string | undefined {
  if (!v.trim()) return "Service name is required";
}
function validateMins(v: string): string | undefined {
  if (!v.trim()) return "Duration is required";
  const n = parseInt(v);
  if (isNaN(n) || n < 15) return "Minimum 15 minutes";
  if (n > 480) return "Maximum 480 minutes";
}
function validatePrice(v: string): string | undefined {
  if (!v.trim()) return "Price is required";
  const n = parseFloat(v);
  if (isNaN(n) || n < 0) return "Price cannot be negative";
}

function AddServiceForm({ onAdd, onCancel }: { onAdd: (svc: ServiceDraft) => void; onCancel: () => void }) {
  const [name,   setName]   = useState("");
  const [mins,   setMins]   = useState("");
  const [price,  setPrice]  = useState("");
  const [errors, setErrors] = useState<ServiceFieldErrors>({});

  function submit() {
    const next: ServiceFieldErrors = {
      name:  validateServiceName(name),
      mins:  validateMins(mins),
      price: validatePrice(price),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onAdd({ name: name.trim(), mins: parseInt(mins), price: parseFloat(price) });
  }

  return (
    <Card variant="outline" padding="16px" className="flex flex-col gap-3 mt-2">
      <Input
        label="Service name"
        placeholder="e.g. Balayage"
        value={name}
        onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((er) => ({ ...er, name: undefined })); }}
        onBlur={() => setErrors((er) => ({ ...er, name: validateServiceName(name) }))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        error={errors.name}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <div className="flex gap-3">
        <Input
          label="Minutes"
          type="number"
          placeholder="60"
          min={15}
          step={15}
          value={mins}
          onChange={(e) => { setMins(e.target.value); if (errors.mins) setErrors((er) => ({ ...er, mins: undefined })); }}
          onBlur={() => setErrors((er) => ({ ...er, mins: validateMins(mins) }))}
          error={errors.mins}
          className="flex-1"
        />
        <Input
          label="Price"
          type="number"
          placeholder="0"
          min={0}
          step={5}
          prefix="$"
          value={price}
          onChange={(e) => { setPrice(e.target.value); if (errors.price) setErrors((er) => ({ ...er, price: undefined })); }}
          onBlur={() => setErrors((er) => ({ ...er, price: validatePrice(price) }))}
          error={errors.price}
          className="flex-1"
        />
      </div>
      <div className="flex gap-2.5">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" size="sm" className="flex-1" onClick={submit}>Add service</Button>
      </div>
    </Card>
  );
}

// ── Setup page ─────────────────────────────────────────────────────────────

let nextId = 1;
const DEFAULT_SERVICES: (ServiceDraft & { id: number })[] = [
  { id: nextId++, name: "Cut & Style",     mins: 60,  price: 85  },
  { id: nextId++, name: "Highlight + Cut", mins: 150, price: 220 },
  { id: nextId++, name: "Root Touch-Up",   mins: 90,  price: 120 },
];

export default function SetupPage() {
  const fieldsRef = useRef<ProfileFieldsHandle>(null);
  const [isPending, startTransition] = useTransition();
  const [services, setServices] = useState<(ServiceDraft & { id: number })[]>(DEFAULT_SERVICES);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addService(svc: ServiceDraft) {
    setServices((prev) => [...prev, { ...svc, id: nextId++ }]);
    setAdding(false);
  }

  function removeService(id: number) {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Trigger per-field validation — highlights failing fields, stops if any fail
    const valid = fieldsRef.current?.validateAll();
    if (!valid) return;

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveSetup(formData, services.map(({ name, mins, price }) => ({ name, mins, price })));
      } catch (err) {
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  }

  return (
    <main className="min-h-screen bg-warm-cream">
      <PageHeader className="justify-center">
        <EyebrowLabel tone="muted">Step 1 of 2</EyebrowLabel>
      </PageHeader>

      <form onSubmit={handleSubmit} className="max-w-[420px] mx-auto px-6 pt-7 pb-[120px]">
        <h1 className="text-[28px] font-bold leading-snug mb-1.5">Set up your profile</h1>
        <p className="text-sm text-muted mb-7 leading-relaxed">
          This is what clients see on your booking link.
        </p>

        {/* Photo upload placeholder */}
        <div className="flex items-center gap-4 mb-7">
          <div className="relative cursor-pointer">
            <div className="size-16 rounded-full bg-stone flex items-center justify-center text-2xl" aria-hidden="true">
              👤
            </div>
            <div className="absolute bottom-0 right-0 size-[22px] rounded-full bg-near-black flex items-center justify-center text-[11px] text-warm-cream" aria-hidden="true">
              +
            </div>
          </div>
          <div>
            <div className="font-bold text-sm text-near-black mb-0.5">Add a photo</div>
            <div className="text-xs text-muted">Helps clients recognise you</div>
          </div>
        </div>

        {/* All profile fields (name, studio, bio, phone, address, industry, specialties, policy) */}
        <ProfileFields ref={fieldsRef} />

        {/* ── Services ── */}
        <div className="flex justify-between items-center mb-3">
          <EyebrowLabel>Your services</EyebrowLabel>
          <span className="text-xs font-bold text-muted bg-stone rounded-full px-2 py-[2px]">
            {services.length}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {services.map((s) => (
            <ServiceListItem
              key={s.id}
              name={s.name}
              subtitle={`${s.mins} min · $${s.price}`}
              actions={
                <IconButton label="Remove service" size="sm" variant="ghost" onClick={() => removeService(s.id)}>
                  ×
                </IconButton>
              }
            />
          ))}
        </div>

        {adding ? (
          <AddServiceForm onAdd={addService} onCancel={() => setAdding(false)} />
        ) : (
          <AddServiceButton onClick={() => setAdding(true)} />
        )}

        <FormError message={error} className="mt-4" />

        {/* Sticky footer CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-warm-cream border-t border-hairline px-6 py-4">
          <div className="max-w-[420px] mx-auto">
            <Button type="submit" variant="primary" size="lg" fullWidth disabled={isPending}>
              {isPending ? "Saving…" : "Save & continue"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
