"use client";

import { useState, useTransition } from "react";
import { Button, Input, EyebrowLabel, Card, IconButton } from "@/components/ui";
import { addService, updateService, deleteService, type ServiceRow } from "../actions";

// ── Service view row ────────────────────────────────────────────────────────

function ServiceViewRow({
  svc,
  isPending,
  onEdit,
  onDelete,
}: {
  svc: ServiceRow;
  isPending: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const priceDisplay = `$${(svc.priceCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {svc.name}
        </div>
        <div style={{ fontSize: "var(--size-caption)", color: "var(--text-muted)" }}>
          {svc.mins} min · {priceDisplay}
        </div>
      </div>
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        <IconButton
          label="Edit service"
          size="sm"
          variant="ghost"
          onClick={onEdit}
          disabled={isPending}
        >
          ✎
        </IconButton>
        <IconButton
          label="Delete service"
          size="sm"
          variant="ghost"
          onClick={onDelete}
          disabled={isPending}
          style={{ color: "var(--danger)" }}
        >
          ×
        </IconButton>
      </div>
    </Card>
  );
}

// ── Shared edit/add form ────────────────────────────────────────────────────

function ServiceForm({
  initial,
  isPending,
  onSave,
  onCancel,
  saveLabel,
}: {
  initial?: ServiceRow;
  isPending: boolean;
  onSave: (name: string, mins: number, price: number) => void;
  onCancel: () => void;
  saveLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mins, setMins] = useState(initial ? String(initial.mins) : "");
  const [price, setPrice] = useState(
    initial ? String(initial.priceCents / 100) : ""
  );

  function handleSave() {
    const parsedMins = parseInt(mins) || 60;
    const parsedPrice = parseFloat(price) || 0;
    onSave(name.trim(), parsedMins, parsedPrice);
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
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={!initial}
      />
      <div style={{ display: "flex", gap: 12 }}>
        <Input
          label="Minutes"
          type="number"
          placeholder="120"
          min={15}
          step={15}
          value={mins}
          onChange={(e) => setMins(e.target.value)}
          style={{ flex: 1 }}
        />
        <Input
          label="Price"
          type="number"
          placeholder="180"
          min={0}
          step={5}
          prefix="$"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          style={{ flex: 1 }}
          onClick={handleSave}
          disabled={isPending || !name.trim()}
        >
          {isPending ? "Saving…" : saveLabel}
        </Button>
      </div>
    </Card>
  );
}

// ── Services section ────────────────────────────────────────────────────────

export default function ServicesSection({ initial }: { initial: ServiceRow[] }) {
  const [services, setServices] = useState<ServiceRow[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAdd(name: string, mins: number, price: number) {
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("mins", String(mins));
    fd.set("price", String(price));
    startTransition(async () => {
      try {
        const newSvc = await addService(fd);
        setServices((prev) => [...prev, newSvc]);
        setAdding(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add service");
      }
    });
  }

  function handleUpdate(id: number, name: string, mins: number, price: number) {
    setError(null);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("mins", String(mins));
    fd.set("price", String(price));
    startTransition(async () => {
      try {
        await updateService(id, fd);
        setServices((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, name, mins, priceCents: Math.round(price * 100) }
              : s
          )
        );
        setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update service");
      }
    });
  }

  function handleDelete(id: number) {
    setError(null);
    startTransition(async () => {
      try {
        await deleteService(id);
        setServices((prev) => prev.filter((s) => s.id !== id));
        if (editingId === id) setEditingId(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete service");
      }
    });
  }

  return (
    <section
      style={{
        borderTop: "1px solid var(--hairline)",
        paddingTop: 32,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <EyebrowLabel style={{ display: "block" }}>Services</EyebrowLabel>
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

      {/* Service rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {services.map((svc) =>
          editingId === svc.id ? (
            <ServiceForm
              key={svc.id}
              initial={svc}
              isPending={isPending}
              saveLabel="Save changes"
              onSave={(name, mins, price) => handleUpdate(svc.id, name, mins, price)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ServiceViewRow
              key={svc.id}
              svc={svc}
              isPending={isPending}
              onEdit={() => {
                setAdding(false);
                setEditingId(svc.id);
              }}
              onDelete={() => handleDelete(svc.id)}
            />
          )
        )}
      </div>

      {/* Add form / add button */}
      {adding ? (
        <ServiceForm
          isPending={isPending}
          saveLabel="Add service"
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
          disabled={isPending}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
            padding: "10px 0",
            background: "none",
            border: "none",
            cursor: isPending ? "not-allowed" : "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--size-small)",
            fontWeight: "var(--weight-medium)",
            color: isPending ? "var(--text-muted)" : "var(--text-secondary)",
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
            marginTop: 12,
          }}
        >
          {error}
        </p>
      )}
    </section>
  );
}
