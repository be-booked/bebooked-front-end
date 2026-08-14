"use client";

import { useState, useTransition } from "react";
import { Button, Input, Card, IconButton, FormError } from "@/components/ui";
import { ServiceListItem } from "@/components/ServiceListItem";
import { AddServiceButton } from "@/components/AddServiceButton";
import { addService, updateService, deleteService, type ServiceRow } from "../actions";

// ── Validators ─────────────────────────────────────────────────────────────

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
  const [name,   setName]   = useState(initial?.name ?? "");
  const [mins,   setMins]   = useState(initial ? String(initial.mins) : "");
  const [price,  setPrice]  = useState(initial ? String(initial.priceCents / 100) : "");
  const [errors, setErrors] = useState<ServiceFieldErrors>({});

  function handleSave() {
    const next: ServiceFieldErrors = {
      name:  validateServiceName(name),
      mins:  validateMins(mins),
      price: validatePrice(price),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSave(name.trim(), parseInt(mins), parseFloat(price));
  }

  return (
    <Card variant="outline" padding="16px" className="flex flex-col gap-3 mt-2">
      <Input
        label="Service name"
        placeholder="e.g. Balayage"
        value={name}
        onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((er) => ({ ...er, name: undefined })); }}
        onBlur={() => setErrors((er) => ({ ...er, name: validateServiceName(name) }))}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        error={errors.name}
        autoFocus={!initial}
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
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving…" : saveLabel}
        </Button>
      </div>
    </Card>
  );
}

// ── Services section ────────────────────────────────────────────────────────

export default function ServicesSection({ initial }: { initial: ServiceRow[] }) {
  const [services,  setServices]  = useState<ServiceRow[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding,    setAdding]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
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
    <div>
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

      <FormError message={error} className="mt-3" />
    </div>
  );
}
