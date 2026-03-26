# FlightCheck - Project Context

## Deployment

- **Live site**: https://main.d2m1s5v9i0w5nr.amplifyapp.com/
- **Hosting**: AWS Amplify (static SPA, auto-deploys from `main` branch)
- **Build**: `npm run build` produces `dist/` — Amplify serves this as static files
- **No backend in production**: The Express API server (`server/index.cjs`) is only for local Docker dev. On Amplify, the app falls back to localStorage automatically via `useDatabase.ts`.
- **Peer dep conflict**: `vite-plugin-pwa` doesn't officially support Vite 8. The `.npmrc` file has `legacy-peer-deps=true` to handle this. Do not remove it or Amplify builds will fail.

## Architecture

- React 19 + TypeScript + Vite 8 SPA
- CSS Modules with CSS custom properties for theming (dark/light)
- State: `useDatabase` hook tries `/api/db` first, falls back to localStorage
- Static plane data in `src/data/planes.ts` and `src/data/checklists.ts`
- Custom/user data layered on top via `useFleet` hook

## Key Conventions

- All icons from `lucide-react` — check availability before using (e.g., `Github` doesn't exist, use inline SVG instead)
- Plane types: 'GA', 'Airliner', 'Turboprop', 'Regional Jet', 'GA Twin', 'Widebody', 'Utility Turboprop'
- Dark theme is default; light theme via `[data-theme="light"]` CSS override
- Right-click context menu on plane cards (not buttons) for hide/change image
- Confirmation modals via `useConfirm` hook (not browser `confirm()`)

## Local Development

```bash
# With Docker Compose (persistent data)
docker compose up -d --build

# Or manual Docker
docker rm -f flightcheck
docker build -t flightcheck .
docker run -d --name flightcheck -p 5173:5173 -v flightcheck-data:/data flightcheck
```

## Branching Strategy

- **`main`** is the production branch — Amplify auto-deploys from it. Never commit directly to `main`.
- All work goes on **feature branches** off `main`: `feature/<short-name>`, `fix/<short-name>`, etc.
- When ready, open a **PR** from the feature branch into `main`.
- After merge, delete the feature branch.

## Development Workflow (QA Loop)

All non-trivial changes must follow this pipeline:

1. **Branch** — Create a feature branch off `main`: `git checkout -b feature/<name> main`
2. **Research** — Understand the feature/fix context. Read relevant files, check types, review existing patterns.
3. **Plan** — Define the implementation approach. List files to change, identify risks, align with conventions above.
4. **Implement** — Make changes via agents in isolated worktrees where possible. One feature per agent to avoid conflicts.
5. **Security Review** — Check for XSS, injection, unsafe `dangerouslySetInnerHTML`, unvalidated user input, exposed secrets. Review any new dependencies.
6. **QA (Build + Lint + Test)** — Run `npm run build` (TypeScript + Vite). Run `npm run lint`. Run `npm test` if applicable. Fix all errors before proceeding.
7. **UI Review** — Verify the change renders correctly: check dark/light themes, mobile/tablet/desktop breakpoints, keyboard accessibility, no console errors.
8. **PR to main** — Push the feature branch and open a PR. Only merge after all above steps pass.

If any step fails, loop back to **Implement** and fix before re-running the pipeline.

## Testing Changes

Before pushing, verify the build succeeds:
```bash
npm run build        # TypeScript + Vite production build
npm run lint         # ESLint checks
npm test -- --run    # Vitest (if tests exist for changed code)
```
Docker build also works as a full integration check:
```bash
docker build -t flightcheck .
```
This runs `npm install` and copies source — if it builds, Amplify will too. TypeScript errors will fail the Amplify build (`tsc -b && vite build`).
