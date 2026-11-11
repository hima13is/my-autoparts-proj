# my-autoparts-proj · FitGaadi

Car & SUV accessories store for India. _Sahi fit. Seedha ghar._
Shoppers pick their car once and only see accessories that fit it. Products are **drop-shipped from suppliers**.

- **Plan & architecture:** [`docs/PLAN.md`](docs/PLAN.md)
- **Decisions:** [`docs/adr/`](docs/adr/)
- **Manual test scripts per phase:** [`docs/test-plans/`](docs/test-plans/)

| Part                                                   | Tech                    | Folder                     | Local URL                                                |
| ------------------------------------------------------ | ----------------------- | -------------------------- | -------------------------------------------------------- |
| Storefront (what shoppers see)                         | Next.js 16 + Tailwind 4 | `apps/storefront`          | http://localhost:3000                                    |
| Backend API + Admin dashboard                          | Medusa 2.22 (Node.js)   | `apps/backend`             | http://localhost:9000 · admin: http://localhost:9000/app |
| Shared code (types, INR formatting)                    | TypeScript              | `packages/shared`          | n/a                                                      |
| Design system (tokens, logo, components)               | React + Storybook 10    | `packages/ui`              | Storybook: http://localhost:6006                         |
| Local services (Postgres, Redis, Meilisearch, Mailpit) | Docker                  | `infra/docker-compose.yml` | Mailpit inbox: http://localhost:8025                     |

**Staging**

| What                       | URL                                                | Hosting                                |
| -------------------------- | -------------------------------------------------- | -------------------------------------- |
| Storefront                 | https://fitgaadi-storefront.vercel.app             | Vercel (functions in Singapore)        |
| Clickable prototype        | https://fitgaadi-storefront.vercel.app/prototype   | Vercel (demo data, hidden from search) |
| Storybook (all components) | https://fitgaadi-storybook.vercel.app              | Vercel                                 |
| Backend API + admin        | https://backend-production-1770.up.railway.app/app | Railway, Singapore (Postgres)          |
| Error tracking             | sentry.io → `storefront`, `backend`                | Sentry (errors only, no customer data) |

Env var names are listed in `.env.example`; values live in Vercel/Railway only. Brand sheet: [`docs/brand/brand-sheet.pdf`](docs/brand/brand-sheet.pdf).

## Project status

| Phase                                    | Status                    | Tag      |
| ---------------------------------------- | ------------------------- | -------- |
| 0 · Foundations & setup                  | ✅ Signed off 9 Nov 2026  | `v0.1.0` |
| 1 · Brand & design system                | ✅ Signed off 11 Nov 2026 | `v0.2.0` |
| 2 · Catalogue, vehicle selector & search | In progress               |          |
| 3–5                                      | Not started               |          |

Details per phase: [`docs/test-plans/`](docs/test-plans/).

## One-time setup (Windows)

You need: **Node.js ≥ 22.23** (you have 24 ✅), **Git** ✅, **pnpm**, **Docker Desktop**, optionally **GitHub CLI**.

```powershell
# 1. pnpm (no admin rights needed)
npm install -g pnpm@10

# 2. Docker Desktop: install from https://www.docker.com/products/docker-desktop/ (needs WSL 2), then start it.

# 3. Install project dependencies (from the repo root)
pnpm install

# 4. Environment files (local defaults already match docker-compose)
Copy-Item apps\backend\.env.template apps\backend\.env
Copy-Item apps\storefront\.env.template apps\storefront\.env.local

# 5. Start Postgres/Redis/Meilisearch/Mailpit and create the database tables + India store data
pnpm services:up
pnpm db:migrate

# 6. Create your admin login
cd apps\backend; pnpm exec medusa user -e you@example.com -p "a-strong-password"; cd ..\..
```

## Every day

```powershell
pnpm services:up   # if Docker services aren't running
pnpm dev           # starts storefront (3000) and backend + admin (9000) together
pnpm --filter @autoparts/ui dev   # Storybook on 6006 (design system)
```

## Design system (`packages/ui`)

- Build every screen from `@autoparts/ui` components. Colours, fonts and spacing come from `@autoparts/ui/theme.css` (Tailwind 4 tokens).
- Add a Storybook story for every new component and state. Each story is also a test: it renders in Chromium and **fails on any accessibility violation**.
- Screenshot baselines are made in Linux Docker so they match CI exactly. After an intended visual change, run `bash scripts/visual-baselines.sh`, review the PNGs and commit them.
- Logo files are generated: `pnpm --filter @autoparts/ui logo`. Brand sheet: `pnpm --filter @autoparts/ui build:storybook`, then `pnpm --filter @autoparts/ui brand-sheet`.

## Checks (the same ones CI runs on every pull request)

| Command                                      | What it checks                                                                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`                                  | Code style & common mistakes                                                                                                                                                                                                                     |
| `pnpm typecheck`                             | TypeScript types                                                                                                                                                                                                                                 |
| `pnpm test`                                  | Unit tests (all packages)                                                                                                                                                                                                                        |
| `pnpm test:integration`                      | Backend API tests against a real Postgres (needs `pnpm services:up`)                                                                                                                                                                             |
| `pnpm build`                                 | Production builds                                                                                                                                                                                                                                |
| `pnpm test:e2e`                              | Browser tests on Pixel 7, iPhone 14 and desktop Chrome, incl. accessibility scan. Run `pnpm build` first; first time also `cd apps/storefront; pnpm exec playwright install chromium webkit`. If `pnpm dev` holds port 3000, set `E2E_PORT=3200` |
| `pnpm --filter @autoparts/ui test:storybook` | Every Storybook story in Chromium with an axe accessibility check (first time: `cd packages/ui; pnpm exec playwright install chromium`)                                                                                                          |
| `bash scripts/visual-baselines.sh --check`   | Screenshot comparison of all stories + prototype pages at 5 widths (needs Docker)                                                                                                                                                                |
| Lighthouse (CI only)                         | Prototype pages must score ≥ 95 for accessibility                                                                                                                                                                                                |
| `pnpm format`                                | Auto-format all files                                                                                                                                                                                                                            |

## Conventions

- **Branches:** `main` is protected and always deployable. Work on `feat/…`, `fix/…`, `chore/…`, `docs/…`, `test/…` branches and merge with a pull request.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(storefront): add vehicle selector`. Enforced by commitlint.
- **Releases:** one Git tag per signed-off phase (`v0.1.0` = Phase 0, `v0.2.0` = Phase 1).
- **Merging:** phase PRs wait for the owner's sign-off. Maintenance PRs (Dependabot, small CI fixes) may be merged once CI is green, skipping dependency versions released less than 2 weeks ago.
- **CI:** 8 required checks on `main`: lint/types/unit/build, backend integration, e2e, secret scan, commit messages, design system, visual regression, Lighthouse.
- **Secrets:** never committed. `.env.example` lists names only; CI scans for leaks (gitleaks).
