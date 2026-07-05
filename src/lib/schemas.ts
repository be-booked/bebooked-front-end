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
  slug: z.string()
    .min(1, "Handle is required")
    .max(60, "Handle must be 60 characters or less")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only")
    .optional(),
  studio,
  bio,
  // Phone required for providers
  phone: z.string()
    .min(1, "Phone number is required")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Enter a valid 10-digit phone number"),
  // Address — street, state, zip required; city optional
  addressStreet: z.string().min(1, "Street address is required").max(200),
  addressCity:   z.string().min(1, "City is required").max(100),
  addressState:  z.string()
    .min(1, "State is required")
    .transform((v) => v.toUpperCase().trim())
    .refine((v) => /^[A-Z]{2}$/.test(v), "Enter a 2-letter state code (e.g. NC)"),
  addressZip: z.string()
    .min(1, "ZIP code is required")
    .transform((v) => v.trim())
    .refine((v) => /^\d{5}(-\d{4})?$/.test(v), "Enter a valid ZIP code (e.g. 28202)"),
  cancellationPolicy: z.string().min(1, "Cancellation policy is required").max(150, "Cancellation policy must be 150 characters or less"),
});

export const createSlotSchema = z.object({
  service_name:        z.string().min(1, "Service is required"),
  slot_date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  slot_time:           z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  duration_mins:       mins,
  price:               dollars,
  note:                z.string().max(500).optional(),
  booking_cutoff_mins: z.preprocess(
    (v) => (v === "" || v == null ? undefined : Number(v)),
    z.number().int().min(0).optional()
  ),
});

export const bookingSchema = z.object({
  client_name:  z.string().min(1, "Name is required").max(100),
  client_phone: z.string()
    .min(1, "Phone number is required")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Enter a valid 10-digit US phone number"),
  client_email: z.string().email("Enter a valid email address").min(1, "Email is required"),
});

// ── Helper ─────────────────────────────────────────────────────────────────

/** Parse a ZodError into a single user-facing message. */
export function firstZodError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Invalid input";
}
