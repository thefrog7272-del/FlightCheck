# CLAUDE.md

Persistent context for Claude (and other AI assistants) working on this repo.
Keep this file up to date as architecture, schema, or conventions change.

## Project

FlightCheck is a flight-simulator checklist web app. React/TS front end, Supabase
as the shared backend, Cloudflare Workers/D1 for an alternate API path, and a
Chrome extension + MSFS in-panel addon as auxiliary integrations.

Primary user flows:
1. Browse / search aircraft on the home page.
2. Run through a checklist phase-by-phase; progress persists.
3. Import new planes + checklists from JSON or CSV (admins push to the shared
   Supabase DB; non-admins keep them in localStorage or submit for review).

## Tech stack

See `package.json` for exact versions. High-level: React 19 + TS (strict), Vite, React Router, Supabase,
Cloudflare Workers/D1, Vitest + Testing Library, CSS Modules.

## Database schema (Supabase / Postgres)

**Canonical source:** `supabase/schema.sql`. Incremental changes in `migrations/`.

**Key design notes:**
- `shared_planes`: One row per (name, ability variant) combo. UI groups cards by `name`.
- `shared_checklists`: One row per (plane, category). `phases` is JSON-stringified.
- `pending_submissions`: Non-admin submissions awaiting review.
- **RLS:** All tables public-read. Writes require admin flag in `auth.users.user_metadata.is_admin`.

## JSON import formats

`src/hooks/useImportHandlers.ts::handleJsonImport` accepts six formats, detected
by shape. Order matters — the first matching shape wins.

1. **Flat array** — `[{ name, manufacturer, phase, item, expectedState, category? }, …]`.
   Rows grouped by `phase`. `category` routes rows into the main checklist vs
   emergency/abnormal/reference_table sub-checklists.
2. **Plane+checklist pair** — `{ plane: {…}, checklist: { phases: […] } }`.
3. **Phase list** — `{ name?, planeId?, phases: […] }`.
4. **Fleet backup** — `{ version: 1, custom_planes: …, custom_checklists: …, … }`.
5. **Custom bag** — `{ custom_planes?, custom_checklists? }` (fleet backup without version).
6. **Checklist Reader format** — `{ aircraft, checklist: [{ name|title, type?, items: [{callout, response, "type:"}] }], nickname? }`.
   - `type:` on items tags them as Emergency / Abnormal / Reference (mixed
     phases are supported; deduplicated across categories).
   - **`nickname` is parsed for two orthogonal variant dimensions**:
     - **Ability variant** — Beginner, Intermediate, Expert, Advanced,
       Professional, etc. (see `ABILITY_VARIANTS` for the full list).
     - **Addon developer variant** — major MSFS addon devs (FlyByWire,
       iniBuilds, Asobo, Fenix, PMDG, Just Flight, …). The `aircraft` field is
       used as a fallback source, so a plain `"Fenix A320"` aircraft with no
       nickname still gets tagged. See `ADDON_DEVELOPERS` for the full list.
   - Matched keywords become `ability_variant` and `addon_developer_variant`
     on the plane, and both contribute slug suffixes to `plane_id`:
     `{name-slug}{-developer-slug}{-ability-slug}`. So FlyByWire A320neo
     Beginner → `a320neo-flybywire-beginner`, iniBuilds A320neo (no ability)
     → `a320neo-inibuilds`, stock/unknown A320neo → `a320neo`. This lets every
     (name × developer × ability) combo coexist as its own `shared_planes` row
     instead of overwriting each other.
   - No keywords matched → both variant fields are null and `plane_id` is the
     plain slug.

`deriveAbilityVariant(nickname)` and `deriveAddonDeveloper(...sources)` in
`useImportHandlers.ts` are the single sources of truth for that logic; both are
unit-tested in `src/hooks/__tests__/useImportHandlers.test.ts`.

`PlaneCard.tsx` groups variants by `addon_developer_variant` (null → "Default")
and shows a two-level picker on left-click when there's more than one variant:
developers first, then ability variants within the chosen developer. If there's
only one developer group, the picker goes straight to ability variants.

## Admin vs non-admin import paths

`useImportHandlers.importPlane` branches on `isAdmin`:
- **Admin** → upserts `shared_planes` + `shared_checklists` via `src/api/sharedPlanes.ts`.
  Collision on `plane_id` → update (overwrite). Also clears `shared_planes_cache`
  localStorage and calls `refreshSharedPlanes`.
- **Non-admin** → writes to local `useFleet` state (which persists to localStorage).
  User is then prompted to submit a `pending_submissions` row for admin review.

## Caching

`useSharedPlanes` keeps a `localStorage` cache under `shared_planes_cache` so the
grid paints instantly on repeat visits. It's invalidated after any admin write.
If you change the shape of `Plane`/`SharedChecklistRecord`, bump the cache or
tell users to clear the key.

## Auth

`src/contexts/AuthContext.tsx` wraps the app. `isAdmin` is derived from
`user.user_metadata.is_admin`. Set that in the Supabase dashboard under
Authentication → Users → the relevant user's metadata.

## Commands

See `package.json` scripts for the full list. Common: `npm run dev` (Vite dev server on :5173), 
`npm run build`, `npm run test`, `npm run lint`.

`docker compose up -d --build` runs the production bundle on :5173 with env vars baked in from `docker-compose.yaml`.

## Environment

`.env` / Docker env supply:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_PDF_CONVERTER_URL` *(optional PDF-to-checklist lambda)*
- `VITE_UNSPLASH_ACCESS_KEY` *(optional, improves `enrichPlane` image search)*

The Supabase project URL is embedded in `docker-compose.yaml`; rotate the anon
key via the Supabase dashboard → Project Settings → API.

## Testing notes

- Tests live under `src/**/__tests__/*.test.ts(x)`.
- `vitest.setup.ts` configures jsdom + Testing Library.
- `Vitest` currently fails if `node_modules` was installed on a different OS
  (rolldown has native per-platform bindings). Reinstall before running tests
  in a new environment.

## Known gotchas

- `sql/schema.sql` at the repo root is a broken shell heredoc (not real SQL).
  The canonical schema is `supabase/schema.sql`; don't edit the root one.
- `src/pages/Homebackup.tsx` is a historical snapshot of `Home.tsx`. Not wired up.
  Don't modify unless consciously restoring something.
- `tools/migrate-to-supabase.js` and `scripts/sync-static-data.cjs` still know
  the legacy "variant key" scheme (`plane_id::Emergency`) for deriving category
  — that's intentional for static-data round-tripping. They no longer emit a
  `variant_name` column.
- The plane card groups by `name` in `Home.tsx`. If you add new display metadata
  that varies per variant (manufacturer, image, type), decide whether the
  "representative" (first) row is correct, or pick a canonical one explicitly.

## Conventions

- Prefer typed API helpers in `src/api/` over raw Supabase calls in components.
- Console logging in production code uses a `[FlightCheck …]` prefix for
  grep-ability — keep that pattern for new log lines.
- Snake_case for DB columns, camelCase in TS, converted at the `api/` boundary
  *unless* the DB column is referenced directly in UI code. `ability_variant`
  was kept snake_case end-to-end to match existing conventions; do the same for
  new plane/checklist fields.
