import { z } from "zod";

// ── Reusable field types ───────────────────────────────────────────────────

const name    = z.string().min(1, "Name is required").max(100);
const bio     = z.string().max(250, "Bio must be 250 characters or less").optional();
const studio  = z.string().max(100).optional();
const mins    = z.coerce.number({ error: "Duration must be a number" }).min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours");
const dollars = z.coerce.number({ error: "Price must be a number" }).min(0, "Price cannot be negative");

// ── Schemas ────────────────────────────────────────────────────────────────

export const setupSchema = z.object({
  name,
  studio,
  location: z.string().max(100).optional(),
  bio,
});

export const serviceDraftSchema = z.object({
  name:  z.string().min(1, "Service name is required").max(100),
  mins,
  price: dollars,
});

export const serviceFormSchema = z.object({
  name:  z.string().min(1, "Service name is required").max(100),
  mins:  z.coerce.number().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
});

export const profileSchema = z.object({
  name,
  slug:   z.string().min(1, "Handle is required").max(60).regex(/^[a-z0-9-]+$/, "Handle can only contain lowercase letters, numbers, and hyphens").optional(),
  studio,
  bio,
});

export const createSlotSchema = z.object({
  service_name:  z.string().min(1, "Service is required"),
  slot_date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  slot_time:     z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  duration_mins: mins,
  price:         dollars,
  note:          z.string().max(500).optional(),
});

export const bookingSchema = z.object({
  client_name:  z.string().min(1, "Name is required").max(100),
  client_phone: z.string()
    .min(1, "Phone number is required")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length >= 7 && v.length <= 15, "Enter a valid phone number"),
});

// ── Helper ─────────────────────────────────────────────────────────────────

/** Parse a ZodError into a single user-facing message. */
export function firstZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Invalid input";
}
