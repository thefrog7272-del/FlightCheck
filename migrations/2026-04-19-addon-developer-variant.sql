-- FlightCheck migration: addon developer variants
-- Date: 2026-04-19
--
-- Adds an `addon_developer_variant` column to shared_planes so a single
-- aircraft "name" (e.g. "Airbus A320neo") can have multiple rows differing by
-- which MSFS addon developer produced the checklist (FlyByWire / iniBuilds /
-- Asobo / etc.). Each row keeps its own `ability_variant` dimension so a
-- developer can ship multiple ability levels of the same aircraft.
--
-- plane_id suffixing:
--   base        = slug(name)
--   + dev       = `-{developer-slug}`  when non-null
--   + ability   = `-{ability-keyword}` when non-null
--
-- so FlyByWire Beginner A320neo → a320neo-flybywire-beginner, while the bare
-- Asobo A320neo stays as a320neo-asobo (ability null → no suffix).
--
-- Run this in the Supabase SQL editor. Safe to re-run.

BEGIN;

ALTER TABLE shared_planes
  ADD COLUMN IF NOT EXISTS addon_developer_variant TEXT;

COMMIT;
