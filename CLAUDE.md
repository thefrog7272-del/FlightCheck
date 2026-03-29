# FlightCheck - Project Context

## Deployment

- **Live site**: https://main.d2m1s5v9i0w5nr.amplifyapp.com/
- **Hosting**: AWS Amplify (static SPA, auto-deploys from `main` branch)
- **Build**: `npm run build` produces `dist/` — Amplify serves this as static files
- **Backend**: AWS Amplify Gen 2 — Cognito (auth), AppSync (GraphQL API), DynamoDB (shared planes)
- **Peer dep conflict**: `vite-plugin-pwa` doesn't officially support Vite 8. The `.npmrc` file has `legacy-peer-deps=true` to handle this. Do not remove it or Amplify builds will fail.

## Architecture

- React 19 + TypeScript + Vite 8 SPA
- CSS Modules with CSS custom properties for theming (dark/light)
- **Shared planes**: Fetched from DynamoDB via AppSync GraphQL. Cached in localStorage (stale-while-revalidate, 24h). Falls back to static data in `src/data/planes.ts` and `src/data/checklists.ts` if API and cache both unavailable.
- **User-local data**: Progress, favorites, notes, timer, custom imports — all in localStorage via `useDatabase` hook. NOT in the cloud.
- **Admin auth**: Cognito user pool with `admin` group. Admin login at `/admin`. Admins can manage shared planes, approve user submissions.
- `useSharedPlanes` hook fetches from AppSync; `useFleet` merges shared + custom planes.

## Key Conventions

- All icons from `lucide-react` — check availability before using (e.g., `Github` doesn't exist, use inline SVG instead)
- Plane types: 'GA', 'Airliner', 'Turboprop', 'Regional Jet', 'GA Twin', 'Widebody', 'Utility Turboprop', 'Military'
- Dark theme is default; respects `prefers-color-scheme` on first visit. Light theme via `[data-theme="light"]` CSS override
- Right-click context menu on plane cards for hide/delete/change image
- Confirmation modals via `useConfirm` hook (not browser `confirm()`)
- `useRef<T | null>(null)` — always pass initial value, never `useRef<T>()` (Amplify's stricter TS rejects it)

## AWS Backend

### Resources (eu-west-2)
- **Cognito User Pool**: `eu-west-2_PiGk2P7Pg` (admin group: `admin`)
- **Cognito Identity Pool**: `eu-west-2:63049872-be5a-40a7-8a32-9f86ad24c5a5` (guest access enabled)
- **AppSync API**: `https://ep3mvuopvbh6rbznjkguq7i5b4.appsync-api.eu-west-2.amazonaws.com/graphql`
- **DynamoDB tables**: SharedPlane, SharedChecklist, PendingSubmission

### Data Models
- `SharedPlane`: planeId, name, manufacturer, image, type, sim, sortOrder — **public read, admin write**
- `SharedChecklist`: planeId, phases (JSON string) — **public read, admin write**
- `PendingSubmission`: name, manufacturer, image, type, sim, phases, submittedBy, status — **guest create+read, admin full access**

### Auth Rules
- Unauthenticated users: can read shared planes, submit pending planes
- Admin users (Cognito `admin` group): full CRUD on shared planes, approve/reject submissions
- Admin login: email/password via Cognito (no Google/social auth yet)

### Admin Credentials
- Email: `admin@flightcheck.app`
- Password: set on first login (temp password was `TempPass123!`)

### Amplify Backend Management
- Schema defined in `amplify/data/resource.ts`, auth in `amplify/auth/resource.ts`
- Config in `amplify_outputs.json` (committed to repo — public endpoints only, no secrets)
- **CDK/backend deps are NOT in package.json** — they break Amplify Hosting builds. For local sandbox:
  ```bash
  npm install --save-dev @aws-amplify/backend aws-cdk-lib constructs --legacy-peer-deps
  npx ampx sandbox --once
  ```
  Then remove them from package.json before pushing.

## Local Development

```bash
npm run dev          # Vite dev server on port 5173
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint checks
npm test -- --run    # Vitest
```

## Branching Strategy

- **`main`** is the production branch — Amplify auto-deploys from it.
- All work goes on **feature branches** off `main`: `feature/<short-name>`, `fix/<short-name>`, etc.
- When ready, merge to main and push.
- After merge, delete the feature branch.

## Pre-Push Gate (MANDATORY)

**Before EVERY push to `main`** (direct push or merge), you MUST run and pass ALL of these:

```bash
npm run build        # TypeScript compilation + Vite build — catches unused imports, type errors
npm run lint         # ESLint — catches code quality issues
```

If either command fails, DO NOT push. Fix the errors first. This is a hard gate — no exceptions. Amplify auto-deploys from `main`, so a broken push = broken production.

## Development Workflow (QA Loop)

All non-trivial changes must follow this pipeline:

1. **Branch** — Create a feature branch off `main`: `git checkout -b feature/<name> main`
2. **Research** — Understand the feature/fix context. Read relevant files, check types, review existing patterns.
3. **Plan** — Define the implementation approach. List files to change, identify risks, align with conventions above.
4. **Implement** — Make changes via agents in isolated worktrees where possible. One feature per agent to avoid conflicts.
5. **Security Review** — Check for XSS, injection, unsafe `dangerouslySetInnerHTML`, unvalidated user input, exposed secrets. Review any new dependencies.
6. **QA (Build + Lint + Test)** — Run `npm run build` (TypeScript + Vite). Run `npm run lint`. Run `npm test` if applicable. **All must pass — no exceptions.**
7. **UI Review** — Verify the change renders correctly: check dark/light themes, mobile/tablet/desktop breakpoints, keyboard accessibility, no console errors.
8. **Merge to main** — Only after all above steps pass. Re-run the pre-push gate after merge.

If any step fails, loop back to **Implement** and fix before re-running the pipeline.

## CI / Deploy Monitoring

- **GitHub Actions** (`.github/workflows/ci.yml`) runs `npm run build` + `npm run lint` on every push to `main` and every PR. Check status at the repo's Actions tab or via `gh run list`.
- **Amplify** auto-deploys from `main` after CI. If CI passes but Amplify fails, repo admins can check with `aws amplify list-jobs --app-id d2m1s5v9i0w5nr --branch-name main --region eu-west-2`.

## Import Flow

- **Non-admin users**: Imports (CSV/JSON/PDF/DOCX) go to localStorage. After import, users are prompted to "Submit to community" — this creates a PendingSubmission in DynamoDB for admin review.
- **Admin users**: Imports go directly to DynamoDB (SharedPlane + SharedChecklist), visible to all users immediately. Cache is cleared to trigger refresh.

## Key Files

| File | Purpose |
|------|---------|
| `src/hooks/useSharedPlanes.ts` | Fetches shared planes from AppSync, caches in localStorage |
| `src/hooks/useFleet.ts` | Merges shared + custom planes, manages all CRUD |
| `src/hooks/useDatabase.ts` | localStorage persistence for user-local data |
| `src/api/sharedPlanes.ts` | AppSync GraphQL queries/mutations for shared planes and submissions |
| `src/contexts/AuthContext.tsx` | Cognito auth state, admin detection |
| `src/pages/AdminDashboard.tsx` | Admin panel: list/add/edit/delete shared planes, approve submissions |
| `src/pages/AdminLogin.tsx` | Admin login with new-password challenge handling |
| `src/data/planes.ts` / `checklists.ts` | Static fallback/seed data (22 planes) |
| `amplify/data/resource.ts` | AppSync + DynamoDB schema definition |
| `amplify/auth/resource.ts` | Cognito auth configuration |
| `amplify_outputs.json` | Amplify SDK config (public endpoints, committed to repo) |
