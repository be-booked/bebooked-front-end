import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  smallint,
  boolean,
  date,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Enums ──────────────────────────────────────────────────────────────────

export const slotStatus = pgEnum("slot_status", ["open", "booked", "cancelled"]);

// ── Waitlist ───────────────────────────────────────────────────────────────

export const waitlist = pgTable("waitlist", {
  id:        serial("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Stylists ───────────────────────────────────────────────────────────────

export const stylists = pgTable("stylists", {
  id:                 serial("id").primaryKey(),
  clerkUserId:        text("clerk_user_id").notNull().unique(),
  slug:               text("slug").notNull().unique(),
  name:               text("name").notNull(),
  studio:             text("studio"),
  location:           text("location"),
  bio:                text("bio"),
  photoUrl:           text("photo_url"),
  // Contact
  phone:          text("phone"),
  // Address (split for per-field validation and location search)
  addressStreet:  text("address_street"),
  addressCity:    text("address_city"),
  addressState:   text("address_state"),
  addressZip:     text("address_zip"),
  // Industry classification (for marketplace search)
  industry:           text("industry").array(),
  specialties:        text("specialties").array(),
  // Policy
  cancellationPolicy: text("cancellation_policy"),
  isActive:           boolean("is_active").notNull().default(true),
  createdAt:          timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:          timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Services ───────────────────────────────────────────────────────────────

export const services = pgTable("services", {
  id:           serial("id").primaryKey(),
  stylistId:    integer("stylist_id")
                  .notNull()
                  .references(() => stylists.id, { onDelete: "cascade" }),
  name:         text("name").notNull(),
  durationMins: integer("duration_mins").notNull().default(60),
  priceCents:   integer("price_cents").notNull().default(0),
  sortOrder:    smallint("sort_order").notNull().default(0),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Slots ──────────────────────────────────────────────────────────────────

export const slots = pgTable("slots", {
  id:           serial("id").primaryKey(),
  stylistId:    integer("stylist_id")
                  .notNull()
                  .references(() => stylists.id, { onDelete: "cascade" }),
  serviceId:    integer("service_id")
                  .references(() => services.id, { onDelete: "set null" }),
  serviceName:  text("service_name").notNull(),
  durationMins: integer("duration_mins").notNull(),
  priceCents:   integer("price_cents").notNull(),
  // mode: "string" → returns "YYYY-MM-DD" instead of a Date object
  slotDate:     date("slot_date", { mode: "string" }).notNull(),
  slotTime:     time("slot_time").notNull(),
  shortCode:          text("short_code").notNull().unique(),
  status:             slotStatus("status").notNull().default("open"),
  note:               text("note"),
  // null = no cutoff; otherwise, minutes before slot start when booking closes
  bookingCutoffMins:  integer("booking_cutoff_mins"),
  createdAt:          timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:          timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Bookings ───────────────────────────────────────────────────────────────

export const bookings = pgTable("bookings", {
  id:          serial("id").primaryKey(),
  slotId:      integer("slot_id")
                 .notNull()
                 .unique()
                 .references(() => slots.id, { onDelete: "cascade" }),
  clientName:  text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email"),
  smsSent:     boolean("sms_sent").notNull().default(false),
  emailSent:   boolean("email_sent").notNull().default(false),
  bookedAt:    timestamp("booked_at", { withTimezone: true }).notNull().defaultNow(),
});
