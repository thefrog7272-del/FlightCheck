mkdir -p sql
cat > sql/schema.sql << 'EOF'
CREATE TABLE IF NOT EXISTS planes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  image TEXT,
  type TEXT NOT NULL,
  sim_platform TEXT DEFAULT 'both',
  sort_order INTEGER DEFAULT 0,
  author TEXT,
  author_weblink TEXT
);

CREATE TABLE IF NOT EXISTS checklists (
  id TEXT PRIMARY KEY,
  plane_id TEXT NOT NULL,
  variant_name TEXT NOT NULL DEFAULT 'Standard',
  category TEXT NOT NULL DEFAULT 'normal' CHECK(category IN ('normal', 'abnormal', 'emergency', 'reference_table')),
  phases_json TEXT NOT NULL,
  FOREIGN KEY (plane_id) REFERENCES planes(id)
);

CREATE INDEX IF NOT EXISTS idx_checklists_plane ON checklists(plane_id);
EOF
