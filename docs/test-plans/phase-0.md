# Build Phase 0: Test report & manual test script

## Automated results

Local runs on Windows 11 (Node 24.11.1) with real Docker Postgres/Redis; CI on GitHub Actions (Ubuntu, Node 24).

| Check                       | Command                                      | Result (9 Nov 2026)                                                                       |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Unit tests                  | `pnpm test`                                  | ✅ 23 passed (shared 7 · storefront 7 · backend 9)                                        |
| Typecheck                   | `pnpm typecheck`                             | ✅ 3/3 packages                                                                           |
| Lint · format               | `pnpm lint` · `pnpm format:check`            | ✅ 0 problems                                                                             |
| Production build            | `pnpm build`                                 | ✅ storefront + backend + admin dashboard                                                 |
| DB migrations + India seed  | `pnpm db:migrate`                            | ✅ INR store, India region, IN tax region, drop-ship stock location, Standard Delivery    |
| Backend integration         | `pnpm test:integration`                      | ✅ 2 passed (`GET /health` → 200; `/admin/sentry-check` → 401 without login)              |
| E2E incl. axe (WCAG 2.1 AA) | `E2E_EXPECT_BACKEND=connected pnpm test:e2e` | ✅ 16 passed, 2 skipped by design; 0 axe violations on Pixel 7, iPhone 14, desktop Chrome |
| CI on GitHub (PR #1)        | 5 jobs                                       | ✅ all green                                                                              |
| Failing test blocks merge   | PR #2 (closed)                               | ✅ a deliberately failing unit test made GitHub mark the PR **BLOCKED**                   |

Tip: if `pnpm dev` is already using port 3000, run e2e with `E2E_PORT=3200` so Playwright starts its own server.

**Bugs caught and fixed in this phase**

- The green "connected" badge had 4.39:1 contrast (below AA 4.5:1). It now uses a solid fill (≈ 5.4:1).
- Sentry v11 collects user info, cookies, headers and request bodies by default. All of it is now switched off and unit-tested, so customer data never reaches Sentry.
- `/api/sentry-check` was being prerendered at build time (Cache Components), so the token was never checked. It now always runs at request time, with an e2e test.
- Railway's pre-deploy migration step didn't run, so the staging database had no tables. Migrations now run as part of the start command.

## Staging

| What            | URL                                                | Hosting                                   |
| --------------- | -------------------------------------------------- | ----------------------------------------- |
| Storefront      | https://fitgaadi-storefront.vercel.app             | Vercel (edge Mumbai, functions Singapore) |
| Backend API     | https://backend-production-1770.up.railway.app     | Railway, Singapore                        |
| Admin dashboard | https://backend-production-1770.up.railway.app/app | Railway, Singapore                        |
| Error tracking  | sentry.io → projects `storefront` and `backend`    | Sentry (environment `staging`)            |

Checked on 9 Nov 2026: storefront 200 with "Backend: connected"; backend `/health` 200; admin dashboard loads; CORS allows only the storefront; `/admin/sentry-check` 401 without login; `/api/sentry-check` 404 without the token.

Staging runs Postgres + backend only. Redis and Meilisearch are added when a phase first uses them (Phase 2), so we don't pay for idle services.

## Manual test steps for you

### A. Local ✅ (done by you on 9 Nov 2026)

1. `pnpm services:up`, `pnpm db:migrate`, `pnpm dev`; http://localhost:3000 shows "Hello fitgaadi", a green "Backend: connected" badge and ₹1,25,000.
2. Tab once → yellow "Skip to content". Stop the backend → badge turns red, page still works.
3. http://localhost:9000/app → log in → Settings → Regions shows India / INR; Settings → Store shows "FitGaadi".

### B. GitHub

4. Open https://github.com/hima13is/my-autoparts-proj/pull/1 → ✅ all 5 checks green.
5. Open https://github.com/hima13is/my-autoparts-proj/pull/2 (closed) → ✅ red "Lint · Typecheck · Unit tests · Build" check; merge was blocked.
6. Repo → Settings → Branches → ✅ `main` has a rule requiring the 5 checks.

### C. Staging

7. On your **phone (mobile data, not Wi-Fi)** and laptop, open https://fitgaadi-storefront.vercel.app → ✅ "Hello fitgaadi", green **"Backend: connected"**, readable without zooming.
8. Open https://backend-production-1770.up.railway.app/app → ✅ Medusa admin login → log in with the staging credentials → Settings → Regions → ✅ India / INR.
9. While logged in to the admin (same browser), open https://backend-production-1770.up.railway.app/admin/sentry-check → you'll see an error message (expected).
10. In Sentry: project **backend** → Issues → ✅ "Sentry check: deliberate backend error" (environment `staging`). Project **storefront** → Issues → ✅ "Sentry check: deliberate storefront error" (triggered on 9 Nov by Claude).

**Exit criteria:** B + C pass; you reply **"Phase 0 signed off"**. Then we merge PR #1, point Railway at `main`, tag `v0.1.0` and start Phase 1.

## Known follow-ups (not blocking Phase 0)

- **Railway config before 1 Dec 2026:** `railway.json` (Config as Code) is deprecated; migrate to `.railway/railway.ts` with `railway config migrate`.
- **Railway auto-deploys:** install the Railway GitHub App on this repo so pushes deploy automatically; after merge, set the backend's deploy branch to `main` in the Railway dashboard.
- **Sentry source maps:** stack traces are minified until we add a Sentry auth token for uploads (Phase 5 hardening).
- **Sentry + Turbopack warning** "Failed to register diagnostics-channel injection hooks": only affects performance spans, which we don't record. Revisit when upgrading Sentry.
- **Custom domain + Cloudflare DNS:** postponed until the domain is bought.
