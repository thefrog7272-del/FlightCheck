# FlightCheck - Project Context

## Deployment

- **Live site**: https://flightcheck.thefrog7272.workers.dev/
- **Hosting**: Cloudflare Workers Assets (static SPA, auto-deploys from `main` branch via `wrangler deploy`)
- **Build**: `npm run build` produces `dist/` — served by Cloudflare Workers Assets
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Peer dep conflict**: `vite-plugin-pwa` doesn't officially support Vite 8. The `.npmrc` file has `legacy-peer-deps=true` to handle this. Do not remove it or builds will fail.

## Architecture

- React 19 + TypeScript + Vite 8 SPA
- CSS Modules with CSS custom properties for theming (dark/light)
- **Shared planes**: Fetched from Supabase (`shared_planes` table). Cached in localStorage (stale-while-revalidate, 24h). Falls back to static data in `src/data/planes.ts` and `src/data/checklists.ts` if API and cache both unavailable.
- **Shared checklists**: Fetched from Supabase (`shared_checklists` table).
- **Pending submissions**: Stored in Supabase (`pending_submissions` table) for admin review.
- **User-local data**: Progress, favorites, notes, timer, custom imports — all in localStorage via `useDatabase` hook. NOT in the cloud.
- **Admin auth**: Supabase Auth with `admin` group. Admin login at `/admin`. Admins can manage shared planes, approve user submissions.
- `useSharedPlanes` hook fetches from Supabase; `useFleet` merges shared + custom planes.

## Key Conventions

- All icons from `lucide-react` — check availability before using (e.g., `Github` doesn't exist, use inline SVG instead)
- Plane types: 'GA', 'Airliner', 'Turboprop', 'Regional Jet', 'GA Twin', 'Widebody', 'Utility Turboprop', 'Military'
- Dark theme is default; respects `prefers-color-scheme` on first visit. Light theme via `[data-theme="light"]` CSS override
- Right-click context menu on plane cards for hide/delete/change image
- Confirmation modals via `useConfirm` hook (not browser `confirm()`)
- `useRef<T | null>(null)` — always pass initial value, never `useRef<T>()`

## Supabase Backend

### Schema
- **`shared_planes`**: planeId, name, manufacturer, image, type, sim, sortOrder, variant_name, category — **public read, admin write**
- **`shared_checklists`**: planeId, phases (JSON string), variant_name, category — **public read, admin write**
- **`pending_submissions`**: name, manufacturer, image, type, sim, phases, submittedBy, status — **guest create+read, admin full access**

### Auth Rules
- Unauthenticated users: can read shared planes, submit pending planes
- Admin users (Supabase `admin` group): full CRUD on shared planes, approve/reject submissions
- Admin login: email/password via Supabase Auth (no Google/social auth yet)

### Admin Credentials
- Email: `admin@flightcheck.app`
- Password: set on first login (temp password was `TempPass123!`)

### Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key

### Database Schema
- Full PostgreSQL schema with Row Level Security (RLS) in `supabase/schema.sql`
- Migration tool in `tools/migrate-to-supabase.js` seeds Supabase from static data files

## Local Development

```bash
npm run dev          # Vite dev server on port 5173
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint checks
npm test -- --run    # Vitest
```

## Branching Strategy

- **`main`** is the production branch — Cloudflare Workers auto-deploys from it via `.github/workflows/deploy.yml`.
- **Direct pushes to `main` are blocked** (branch protection enforced for all users, including admins). All changes MUST go through a pull request.
- All work goes on **feature branches** off `main`: `feature/<short-name>`, `fix/<short-name>`, etc.
- PRs require the GitHub Actions CI check (`build` job) to pass before merging.
- After merge, delete the feature branch.

## Pre-PR Gate (MANDATORY)

**Before pushing a branch and opening a PR**, you MUST run and pass ALL of these locally:

```bash
npm run build        # TypeScript compilation + Vite build — catches unused imports, type errors
npm run lint         # ESLint — catches code quality issues
```

If either command fails, DO NOT push or open a PR. Fix the errors first. This catches issues locally before CI runs, saving time. GitHub Actions CI will run the same checks — a failing PR cannot be merged.

## Development Workflow (QA Loop)

All non-trivial changes must follow this pipeline:

1. **Branch** — Create a feature branch off `main`: `git checkout -b feature/<name> main`
2. **Research** — Understand the feature/fix context. Read relevant files, check types, review existing patterns.
3. **Plan** — Define the implementation approach. List files to change, identify risks, align with conventions above.
4. **Implement** — Make changes via agents in isolated worktrees where possible. One feature per agent to avoid conflicts.
5. **Security Review** — Check for XSS, injection, unsafe `dangerouslySetInnerHTML`, unvalidated user input, exposed secrets. Review any new dependencies.
6. **QA (Build + Lint + Test)** — Run `npm run build` and `npm run lint`. Run `npm test` if applicable. **All must pass — no exceptions.** Do not proceed until clean.
7. **UI Review** — Verify the change renders correctly: check dark/light themes, mobile/tablet/desktop breakpoints, keyboard accessibility, no console errors.
8. **PR to main** — Push the feature branch and open a PR. CI must pass before merging. Never push directly to `main`.

If any step fails, loop back to **Implement** and fix before re-running the pipeline.

## CI / Deploy Monitoring

- **GitHub Actions** (`.github/workflows/ci.yml`) runs `npm run build` + `npm run lint` on every push to `main` and every PR. Check status at the repo's Actions tab or via `gh run list`.
- **Cloudflare Workers** auto-deploys from `main` via `.github/workflows/deploy.yml` after CI. If CI passes but the deploy fails, check the Actions tab for the deploy job logs.

## Import Flow

- **Non-admin users**: Imports (CSV/JSON/PDF/DOCX) go to localStorage. After import, users are prompted to "Submit to community" — this creates a PendingSubmission in Supabase for admin review.
- **Admin users**: Imports go directly to Supabase (shared_planes + shared_checklists), visible to all users immediately. Cache is cleared to trigger refresh.

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useSharedPlanes.ts` | Fetches shared planes from Supabase, caches in localStorage |
| `src/hooks/useFleet.ts` | Merges shared + custom planes, manages all CRUD |
| `src/hooks/useDatabase.ts` | localStorage persistence for user-local data |
| `src/api/sharedPlanes.ts` | Supabase client queries/mutations for shared planes and submissions |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/contexts/AuthContext.tsx` | Supabase Auth state, admin detection |
| `src/pages/AdminDashboard.tsx` | Admin panel: list/add/edit/delete shared planes, approve submissions |
| `src/pages/AdminLogin.tsx` | Admin login with new-password challenge handling |
| `src/data/planes.ts` / `checklists.ts` | Static fallback/seed data (22 planes) |
| `supabase/schema.sql` | PostgreSQL schema with RLS policies |
| `migration-checklists.sql` | Supabase migration for shared_checklists |
