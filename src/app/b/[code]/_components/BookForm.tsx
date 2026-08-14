"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { Button, Input, FormError } from "@/components/ui";
import { bookingSchema } from "@/lib/schemas";
import { bookSlot } from "../actions";

interface BookFormProps {
  slotId: number;
  shortCode: string;
  stylistSlug: string;
}

type FieldErrors = Partial<Record<"client_name" | "client_phone" | "client_email", string>>;

function validateName(v: string): string | undefined {
  if (!v.trim()) return "Name is required";
}
function formatPhone(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
function validatePhone(v: string): string | undefined {
  if (!v.trim()) return "Phone number is required";
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return "Enter a valid 10-digit US phone number";
}
function validateEmail(v: string): string | undefined {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address";
}

export default function BookForm({ slotId, shortCode }: BookFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [clientName,  setClientName]  = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    // Run all validators and collect per-field errors
    const fieldErrors: FieldErrors = {
      client_name:  validateName(clientName),
      client_phone: validatePhone(clientPhone),
      client_email: validateEmail(clientEmail),
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    // Belt-and-suspenders: Zod parse (catches server-schema mismatches)
    const formData = new FormData(e.currentTarget);
    try {
      bookingSchema.parse(Object.fromEntries(formData));
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Map Zod issues back to per-field errors if any slipped through
        const zodErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const field = issue.path[0] as keyof FieldErrors;
          if (field && !zodErrors[field]) zodErrors[field] = issue.message;
        }
        setErrors(zodErrors);
        return;
      }
    }

    startTransition(async () => {
      try {
        await bookSlot(formData, slotId, shortCode);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          setServerError(err.message);
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
          value={clientName}
          onChange={(e) => { setClientName(e.target.value); if (errors.client_name) setErrors((er) => ({ ...er, client_name: undefined })); }}
          onBlur={() => setErrors((er) => ({ ...er, client_name: validateName(clientName) }))}
          error={errors.client_name}
          placeholder="Maya Brooks"
          autoComplete="name"
        />
        <Input
          label="Phone number"
          name="client_phone"
          type="tel"
          value={clientPhone}
          onChange={(e) => { setClientPhone(formatPhone(e.target.value)); if (errors.client_phone) setErrors((er) => ({ ...er, client_phone: undefined })); }}
          onBlur={() => setErrors((er) => ({ ...er, client_phone: validatePhone(clientPhone) }))}
          error={errors.client_phone}
          placeholder="(704) 555-0118"
          autoComplete="tel"
        />
        <Input
          label="Email"
          name="client_email"
          type="email"
          value={clientEmail}
          onChange={(e) => { setClientEmail(e.target.value); if (errors.client_email) setErrors((er) => ({ ...er, client_email: undefined })); }}
          onBlur={() => setErrors((er) => ({ ...er, client_email: validateEmail(clientEmail) }))}
          error={errors.client_email}
          placeholder="maya@example.com"
          hint={errors.client_email ? undefined : "For your booking confirmation."}
          autoComplete="email"
        />
      </div>

      <FormError message={serverError} className="mb-4" />

      <Button variant="accent" size="lg" fullWidth type="submit" disabled={isPending}>
        {isPending ? "Booking…" : "Book this slot"}
      </Button>
    </form>
  );
}
