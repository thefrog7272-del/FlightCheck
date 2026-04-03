-- Supabase schema for FlightCheck
-- Run this in the Supabase SQL Editor.

-- ── 1. Shared Planes ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plane_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  sim TEXT,
  sort_order INT
);

ALTER TABLE shared_planes ENABLE ROW LEVEL SECURITY;

-- Anyone can read
DROP POLICY IF EXISTS "Anyone can read shared planes" ON shared_planes;
CREATE POLICY "Anyone can read shared planes"
  ON shared_planes FOR SELECT
  USING (true);

-- Only admins can write
DROP POLICY IF EXISTS "Admins can insert shared planes" ON shared_planes;
CREATE POLICY "Admins can insert shared planes"
  ON shared_planes FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

DROP POLICY IF EXISTS "Admins can update shared planes" ON shared_planes;
CREATE POLICY "Admins can update shared planes"
  ON shared_planes FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

DROP POLICY IF EXISTS "Admins can delete shared planes" ON shared_planes;
CREATE POLICY "Admins can delete shared planes"
  ON shared_planes FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- ── 2. Shared Checklists ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plane_id TEXT NOT NULL REFERENCES shared_planes(plane_id) ON DELETE CASCADE,
  phases TEXT NOT NULL
);

ALTER TABLE shared_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read shared checklists" ON shared_checklists;
CREATE POLICY "Anyone can read shared checklists"
  ON shared_checklists FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert shared checklists" ON shared_checklists;
CREATE POLICY "Admins can insert shared checklists"
  ON shared_checklists FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'is_admin')::boolean = true);

DROP POLICY IF EXISTS "Admins can update shared checklists" ON shared_checklists;
CREATE POLICY "Admins can update shared checklists"
  ON shared_checklists FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

DROP POLICY IF EXISTS "Admins can delete shared checklists" ON shared_checklists;
CREATE POLICY "Admins can delete shared checklists"
  ON shared_checklists FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);

-- ── 3. Pending Submissions ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pending_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  image TEXT,
  type TEXT NOT NULL,
  sim TEXT,
  phases TEXT NOT NULL,
  submitted_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pending_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read pending submissions" ON pending_submissions;
CREATE POLICY "Anyone can read pending submissions"
  ON pending_submissions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Anyone can create pending submissions" ON pending_submissions;
CREATE POLICY "Anyone can create pending submissions"
  ON pending_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete pending submissions" ON pending_submissions;
CREATE POLICY "Admins can delete pending submissions"
  ON pending_submissions FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'is_admin')::boolean = true);
