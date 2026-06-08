-- ============================================================
-- Bebooked — Database Schema
-- Run this in the Neon console to set up all tables.
-- All CREATE statements are idempotent (IF NOT EXISTS).
-- ============================================================

-- ── Waitlist (marketing / pre-launch) ────────────────────────
CREATE TABLE IF NOT EXISTS waitlist (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Stylists ─────────────────────────────────────────────────
-- One row per stylist. clerk_user_id is the Clerk user ID,
-- used to link auth to profile. slug is the public URL handle.
CREATE TABLE IF NOT EXISTS stylists (
  id            SERIAL PRIMARY KEY,
  clerk_user_id TEXT        NOT NULL UNIQUE,
  slug          TEXT        NOT NULL UNIQUE,  -- e.g. "jordan-avery"
  name          TEXT        NOT NULL,
  studio        TEXT,
  location      TEXT,
  bio           TEXT,
  photo_url     TEXT,                          -- Cloudflare R2 object URL
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stylists_slug_idx ON stylists (slug);
CREATE INDEX IF NOT EXISTS stylists_clerk_idx ON stylists (clerk_user_id);

-- ── Services ─────────────────────────────────────────────────
-- A stylist's menu of offerings. Used to pre-fill CreateSlot.
CREATE TABLE IF NOT EXISTS services (
  id            SERIAL PRIMARY KEY,
  stylist_id    INTEGER     NOT NULL REFERENCES stylists (id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  duration_mins INTEGER     NOT NULL DEFAULT 60,
  price_cents   INTEGER     NOT NULL DEFAULT 0,  -- store as cents, display as dollars
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS services_stylist_idx ON services (stylist_id);

-- ── Slots ─────────────────────────────────────────────────────
-- A last-minute opening posted by a stylist.
-- short_code is the unique shareable identifier (e.g. "k2x").
DO $$ BEGIN
  CREATE TYPE slot_status AS ENUM ('open', 'booked', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS slots (
  id            SERIAL      PRIMARY KEY,
  stylist_id    INTEGER     NOT NULL REFERENCES stylists (id) ON DELETE CASCADE,
  service_id    INTEGER     REFERENCES services (id) ON DELETE SET NULL,
  service_name  TEXT        NOT NULL,           -- snapshot at post time
  duration_mins INTEGER     NOT NULL,
  price_cents   INTEGER     NOT NULL,
  slot_date     DATE        NOT NULL,
  slot_time     TIME        NOT NULL,
  short_code    TEXT        NOT NULL UNIQUE,    -- random ~4-char code for /b/[code]
  status        slot_status NOT NULL DEFAULT 'open',
  note          TEXT,                           -- optional stylist note
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS slots_stylist_idx  ON slots (stylist_id);
CREATE INDEX IF NOT EXISTS slots_status_idx   ON slots (status);
CREATE INDEX IF NOT EXISTS slots_short_code_idx ON slots (short_code);

-- ── Bookings ─────────────────────────────────────────────────
-- A client claiming an open slot. No client account — name + phone only.
CREATE TABLE IF NOT EXISTS bookings (
  id            SERIAL PRIMARY KEY,
  slot_id       INTEGER     NOT NULL UNIQUE REFERENCES slots (id) ON DELETE CASCADE,
  client_name   TEXT        NOT NULL,
  client_phone  TEXT        NOT NULL,
  sms_sent      BOOLEAN     NOT NULL DEFAULT FALSE,
  booked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bookings_slot_idx ON bookings (slot_id);
