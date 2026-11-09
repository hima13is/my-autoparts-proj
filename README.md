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
| Local services (Postgres, Redis, Meilisearch, Mailpit) | Docker                  | `infra/docker-compose.yml` | Mailpit inbox: http://localhost:8025                     |

**Staging:** storefront https://fitgaadi-storefront.vercel.app (Vercel) · backend + admin https://backend-production-1770.up.railway.app/app (Railway, Singapore) · errors in Sentry (`storefront`, `backend`). Env var names are listed in `.env.example`; values live in Vercel/Railway only.

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
```

## Checks (the same ones CI runs on every pull request)

| Command                 | What it checks                                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm lint`             | Code style & common mistakes                                                                                                                                                                                                                     |
| `pnpm typecheck`        | TypeScript types                                                                                                                                                                                                                                 |
| `pnpm test`             | Unit tests (all packages)                                                                                                                                                                                                                        |
| `pnpm test:integration` | Backend API tests against a real Postgres (needs `pnpm services:up`)                                                                                                                                                                             |
| `pnpm build`            | Production builds                                                                                                                                                                                                                                |
| `pnpm test:e2e`         | Browser tests on Pixel 7, iPhone 14 and desktop Chrome, incl. accessibility scan. Run `pnpm build` first; first time also `cd apps/storefront; pnpm exec playwright install chromium webkit`. If `pnpm dev` holds port 3000, set `E2E_PORT=3200` |
| `pnpm format`           | Auto-format all files                                                                                                                                                                                                                            |

## Conventions

- **Branches:** `main` is protected and always deployable. Work on `feat/…`, `fix/…`, `chore/…`, `docs/…`, `test/…` branches and merge with a pull request.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/), e.g. `feat(storefront): add vehicle selector`. Enforced by commitlint.
- **Releases:** one Git tag per signed-off phase (`v0.1.0` = Phase 0).
- **Secrets:** never committed. `.env.example` lists names only; CI scans for leaks (gitleaks).
