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
      <h2 className="text-base font-bold mb-[14px]">Book this slot</h2>

      <div className="flex flex-col gap-[14px] mb-5">
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

      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      <Button variant="accent" size="lg" fullWidth type="submit" disabled={isPending}>
        {isPending ? "Booking…" : "Book this slot"}
      </Button>
    </form>
  );
}
