"use client";

import { useState, useTransition } from "react";
import { Button, Input } from "@/components/ui";
import { bookSlot } from "../actions";

interface BookFormProps {
  slotId: number;
  shortCode: string;
  stylistSlug: string;
}

export default function BookForm({ slotId, shortCode }: BookFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await bookSlot(formData, slotId, shortCode);
      } catch (err) {
        // NEXT_REDIRECT throws — let it propagate; anything else is a real error
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setError(err.message);
        } else {
          throw err;
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2
        style={{
          fontSize: "var(--size-body)",
          fontWeight: "var(--weight-bold)",
          color: "var(--text-primary)",
          marginBottom: 14,
        }}
      >
        Book this slot
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
        <Input
          label="Your name"
          name="client_name"
          placeholder="Maya Brooks"
          required
          autoComplete="name"
        />
        <Input
          label="Phone number"
          name="client_phone"
          type="tel"
          prefix="+1"
          placeholder="(704) 555-0118"
          hint="We'll text your confirmation — no spam."
          required
          autoComplete="tel"
        />
      </div>

      {error && (
        <p
          style={{
            fontSize: "var(--size-small)",
            color: "var(--danger)",
            marginBottom: 16,
          }}
        >
          {error}
        </p>
      )}

      <Button
        variant="accent"
        size="lg"
        style={{ width: "100%" }}
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Booking…" : "Book this slot"}
      </Button>
    </form>
  );
}
