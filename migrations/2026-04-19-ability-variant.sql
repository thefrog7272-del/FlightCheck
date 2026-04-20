-- FlightCheck migration: ability variants
-- Date: 2026-04-19
--
-- Adds an `ability_variant` column to shared_planes so a single aircraft "name"
-- can have multiple variants (Beginner / Intermediate / Expert / Advanced /
-- Professional). Each variant gets its own shared_planes row with a unique
-- plane_id derived from the aircraft name + variant suffix, and its own
-- shared_checklists row.
--
-- Drops the now-unused `variant_name` column from shared_checklists. It was
-- only touched by legacy migration/seed tooling, never by the running app.
--
-- Run this in the Supabase SQL editor against an existing database. Safe to
-- re-run (uses IF [NOT] EXISTS).

BEGIN;

-- 1. Add ability_variant to shared_planes.
ALTER TABLE shared_planes
  ADD COLUMN IF NOT EXISTS ability_variant TEXT;

-- 2. Drop the unused variant_name column from shared_checklists.
ALTER TABLE shared_checklists
  DROP COLUMN IF EXISTS variant_name;

COMMIT;
