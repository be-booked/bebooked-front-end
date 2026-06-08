"use client";

import { useState, useTransition } from "react";
import { Button, Input, EyebrowLabel, Card, IconButton } from "@/components/ui";
import { ServiceListItem } from "@/components/ServiceListItem";
import { AddServiceButton } from "@/components/AddServiceButton";
import { addService, updateService, deleteService, type ServiceRow } from "../actions";

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
  const [price, setPrice] = useState(initial ? String(initial.priceCents / 100) : "");

  function handleSave() {
    const parsedMins = parseInt(mins) || 60;
    const parsedPrice = parseFloat(price) || 0;
    onSave(name.trim(), parsedMins, parsedPrice);
  }

  return (
    <Card variant="outline" padding="16px" className="flex flex-col gap-3 mt-2">
      <Input
        label="Service name"
        placeholder="e.g. Balayage"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={!initial}
      />
      <div className="flex gap-3">
        <Input
          label="Minutes"
          type="number"
          placeholder="120"
          min={15}
          step={15}
          value={mins}
          onChange={(e) => setMins(e.target.value)}
          className="flex-1"
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
          className="flex-1"
        />
      </div>
      <div className="flex gap-2.5">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
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
            s.id === id ? { ...s, name, mins, priceCents: Math.round(price * 100) } : s
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
    <section className="border-t border-hairline pt-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <EyebrowLabel className="block">Services</EyebrowLabel>
        <span className="text-xs font-bold text-muted bg-stone rounded-full px-2 py-[2px]">
          {services.length}
        </span>
      </div>

      {/* Service rows */}
      <div className="flex flex-col gap-2">
        {services.map((svc) => {
          const priceDisplay = `$${(svc.priceCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
          return editingId === svc.id ? (
            <ServiceForm
              key={svc.id}
              initial={svc}
              isPending={isPending}
              saveLabel="Save changes"
              onSave={(name, mins, price) => handleUpdate(svc.id, name, mins, price)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ServiceListItem
              key={svc.id}
              name={svc.name}
              subtitle={`${svc.mins} min · ${priceDisplay}`}
              actions={
                <>
                  <IconButton
                    label="Edit service"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setAdding(false); setEditingId(svc.id); }}
                    disabled={isPending}
                  >
                    ✎
                  </IconButton>
                  <IconButton
                    label="Delete service"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(svc.id)}
                    disabled={isPending}
                    className="text-danger"
                  >
                    ×
                  </IconButton>
                </>
              }
            />
          );
        })}
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
        <AddServiceButton
          onClick={() => { setEditingId(null); setAdding(true); }}
          disabled={isPending}
        />
      )}

      {error && <p className="text-sm text-danger mt-3">{error}</p>}
    </section>
  );
}
