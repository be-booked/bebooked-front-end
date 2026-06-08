"use client";

import { useState, useTransition } from "react";
import { Button, Input, Textarea, EyebrowLabel, Card, IconButton } from "@/components/ui";
import { PageHeader } from "@/components/PageHeader";
import { ServiceListItem } from "@/components/ServiceListItem";
import { AddServiceButton } from "@/components/AddServiceButton";
import { saveSetup, type ServiceDraft } from "./actions";

// ── Add service inline form ────────────────────────────────────────────────

function AddServiceForm({ onAdd, onCancel }: { onAdd: (svc: ServiceDraft) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState({ name: "", mins: "", price: "" });

  function submit() {
    if (!draft.name.trim()) return;
    onAdd({
      name: draft.name.trim(),
      mins: parseInt(draft.mins) || 60,
      price: parseFloat(draft.price) || 0,
    });
  }

  return (
    <Card variant="outline" padding="16px" className="flex flex-col gap-3 mt-2">
      <Input
        label="Service name"
        placeholder="e.g. Balayage"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <div className="flex gap-3">
        <Input
          label="Minutes"
          type="number"
          placeholder="120"
          min={15}
          step={15}
          value={draft.mins}
          onChange={(e) => setDraft({ ...draft, mins: e.target.value })}
          className="flex-1"
        />
        <Input
          label="Price"
          type="number"
          placeholder="180"
          min={0}
          step={5}
          prefix="$"
          value={draft.price}
          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
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
  const [isPending, startTransition] = useTransition();
  const [services, setServices] = useState<(ServiceDraft & { id: number })[]>(DEFAULT_SERVICES);
  const [adding, setAdding] = useState(false);
  const [bio, setBio] = useState("");
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
    const formData = new FormData(e.currentTarget);
    formData.set("bio", bio);

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
      {/* Step header */}
      <PageHeader className="justify-center">
        <EyebrowLabel tone="muted">Step 1 of 2</EyebrowLabel>
      </PageHeader>

      <form onSubmit={handleSubmit} className="max-w-[420px] mx-auto px-6 pt-7 pb-[100px]">
        <h1 className="text-[28px] font-bold leading-snug mb-1.5">Set up your profile</h1>
        <p className="text-sm text-muted mb-7 leading-relaxed">
          This is what clients see on your booking link.
        </p>

        {/* Photo upload placeholder */}
        <div className="flex items-center gap-4 mb-7">
          <div className="relative cursor-pointer">
            <div
              className="size-16 rounded-full bg-stone flex items-center justify-center text-2xl"
              aria-hidden="true"
            >
              👤
            </div>
            <div
              className="absolute bottom-0 right-0 size-[22px] rounded-full bg-near-black flex items-center justify-center text-[11px] text-warm-cream"
              aria-hidden="true"
            >
              +
            </div>
          </div>
          <div>
            <div className="font-bold text-sm text-near-black mb-0.5">Add a photo</div>
            <div className="text-xs text-muted">Helps clients recognise you</div>
          </div>
        </div>

        {/* Profile fields */}
        <div className="flex flex-col gap-4 mb-7">
          <Input label="Your name" name="name" placeholder="e.g. Jordan Avery" required autoComplete="name" />
          <Input label="Studio / business" name="studio" placeholder="e.g. Avery Hair Co." autoComplete="organization" />
          <Input label="Location" name="location" defaultValue="Charlotte, NC" placeholder="City, State" />
          <div>
            <Textarea
              label="Bio"
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              placeholder="A short line about you and your work"
              rows={3}
            />
            <div className="text-right text-[11px] text-muted mt-1">{bio.length}/250</div>
          </div>
        </div>

        {/* Services */}
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

        {error && <p className="text-sm text-danger mt-4">{error}</p>}

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
