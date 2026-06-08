"use client";

import { useState, useTransition } from "react";
import { Button, Input, Textarea, EyebrowLabel, Card, IconButton } from "@/components/ui";
import { saveSetup, type ServiceDraft } from "./actions";

// ── Service row ────────────────────────────────────────────────────────────

function ServiceRow({
  svc,
  onRemove,
}: {
  svc: ServiceDraft & { id: number };
  onRemove: () => void;
}) {
  return (
    <Card
      variant="linen"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          background: "var(--stone)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 14,
        }}
        aria-hidden="true"
      >
        ✂️
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: "var(--weight-bold)",
            fontSize: "var(--size-small)",
            color: "var(--text-primary)",
            marginBottom: 2,
          }}
        >
          {svc.name}
        </div>
        <div
          style={{
            fontSize: "var(--size-caption)",
            color: "var(--text-muted)",
          }}
        >
          {svc.mins} min · ${svc.price}
        </div>
      </div>
      <IconButton
        label="Remove service"
        size="sm"
        variant="ghost"
        onClick={onRemove}
        style={{ flexShrink: 0 }}
      >
        ×
      </IconButton>
    </Card>
  );
}

// ── Add service inline form ────────────────────────────────────────────────

function AddServiceForm({
  onAdd,
  onCancel,
}: {
  onAdd: (svc: ServiceDraft) => void;
  onCancel: () => void;
}) {
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
    <Card
      variant="outline"
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        marginTop: 8,
      }}
    >
      <Input
        label="Service name"
        placeholder="e.g. Balayage"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
      <div style={{ display: "flex", gap: 12 }}>
        <Input
          label="Minutes"
          type="number"
          placeholder="120"
          min={15}
          step={15}
          value={draft.mins}
          onChange={(e) => setDraft({ ...draft, mins: e.target.value })}
          style={{ flex: 1 }}
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
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" style={{ flex: 1 }} onClick={submit}>
          Add service
        </Button>
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
    // Pass bio via formData (textarea value not auto-captured with state)
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
    <main
      style={{
        minHeight: "100vh",
        background: "var(--warm-cream)",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Step header */}
      <header
        style={{
          borderBottom: "1px solid var(--hairline)",
          padding: "14px var(--gutter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EyebrowLabel tone="muted">Step 1 of 2</EyebrowLabel>
      </header>

      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: "var(--app-max)",
          margin: "0 auto",
          padding: "28px var(--gutter) 100px",
        }}
      >
        <h1
          style={{
            fontSize: "var(--size-title)",
            fontWeight: "var(--weight-bold)",
            color: "var(--text-primary)",
            marginBottom: 6,
            lineHeight: "var(--leading-snug)",
          }}
        >
          Set up your profile
        </h1>
        <p
          style={{
            fontSize: "var(--size-small)",
            color: "var(--text-muted)",
            marginBottom: 28,
            lineHeight: "var(--leading-relaxed)",
          }}
        >
          This is what clients see on your booking link.
        </p>

        {/* Photo upload placeholder */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div style={{ position: "relative", cursor: "pointer" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-pill)",
                background: "var(--stone)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
              }}
              aria-hidden="true"
            >
              👤
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 22,
                height: 22,
                borderRadius: "var(--radius-pill)",
                background: "var(--near-black)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                color: "var(--warm-cream)",
              }}
              aria-hidden="true"
            >
              +
            </div>
          </div>
          <div>
            <div
              style={{
                fontWeight: "var(--weight-bold)",
                fontSize: "var(--size-small)",
                color: "var(--text-primary)",
                marginBottom: 2,
              }}
            >
              Add a photo
            </div>
            <div
              style={{
                fontSize: "var(--size-caption)",
                color: "var(--text-muted)",
              }}
            >
              Helps clients recognise you
            </div>
          </div>
        </div>

        {/* Profile fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          <Input
            label="Your name"
            name="name"
            placeholder="e.g. Jordan Avery"
            required
            autoComplete="name"
          />
          <Input
            label="Studio / business"
            name="studio"
            placeholder="e.g. Avery Hair Co."
            autoComplete="organization"
          />
          <Input
            label="Location"
            name="location"
            defaultValue="Charlotte, NC"
            placeholder="City, State"
          />
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
            <div
              style={{
                textAlign: "right",
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: 4,
              }}
            >
              {bio.length}/250
            </div>
          </div>
        </div>

        {/* Services */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <EyebrowLabel>Your services</EyebrowLabel>
          <span
            style={{
              fontSize: "var(--size-caption)",
              fontWeight: "var(--weight-bold)",
              color: "var(--text-muted)",
              background: "var(--stone)",
              borderRadius: "var(--radius-pill)",
              padding: "2px 8px",
            }}
          >
            {services.length}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {services.map((s) => (
            <ServiceRow key={s.id} svc={s} onRemove={() => removeService(s.id)} />
          ))}
        </div>

        {adding ? (
          <AddServiceForm onAdd={addService} onCancel={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
              padding: "10px 0",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--size-small)",
              fontWeight: "var(--weight-medium)",
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                border: "1.5px solid var(--stone)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
              }}
            >
              +
            </span>
            Add a service
          </button>
        )}

        {error && (
          <p
            style={{
              fontSize: "var(--size-small)",
              color: "var(--danger)",
              marginTop: 16,
            }}
          >
            {error}
          </p>
        )}

        {/* Sticky footer CTA */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--warm-cream)",
            borderTop: "1px solid var(--hairline)",
            padding: "16px var(--gutter)",
          }}
        >
          <div style={{ maxWidth: "var(--app-max)", margin: "0 auto" }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{ width: "100%" }}
              disabled={isPending}
            >
              {isPending ? "Saving…" : "Save & continue"}
            </Button>
          </div>
        </div>
      </form>
    </main>
  );
}
