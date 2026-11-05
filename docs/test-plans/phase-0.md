# Build Phase 0: Test report & manual test script

## Automated results (run locally on 5 Nov 2026, Windows 11, Node 24.11.1)

| Check                      | Command                                      | Result                                                                                             |
| -------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Unit tests                 | `pnpm test`                                  | ✅ 13 passed (shared 7 · storefront 3 · backend 3)                                                 |
| Typecheck                  | `pnpm typecheck`                             | ✅ 3/3 packages                                                                                    |
| Lint                       | `pnpm lint`                                  | ✅ 0 problems                                                                                      |
| Production build           | `pnpm build`                                 | ✅ storefront + backend + admin dashboard                                                          |
| DB migrations + India seed | `pnpm db:migrate`                            | ✅ INR store, India region, IN tax region, drop-ship stock location, Standard Delivery             |
| Backend integration        | `pnpm test:integration`                      | ✅ 1 passed (`GET /health` → 200)                                                                  |
| E2E, backend **down**      | `pnpm test:e2e`                              | ✅ 10 passed, 2 skipped by design (keyboard test is desktop-only)                                  |
| E2E, backend **up**        | `E2E_EXPECT_BACKEND=connected pnpm test:e2e` | ✅ 10 passed, 2 skipped. Axe scan, WCAG 2.1 AA: 0 violations on Pixel 7, iPhone 14, desktop Chrome |

_Local Postgres for this run was a temporary embedded instance because Docker isn't installed yet. CI uses real Postgres 17 + Redis 7 services._

**Bug caught by the tests and fixed:** the green "connected" badge (green text on a light-green tint) had 4.39:1 contrast, below the 4.5:1 AA minimum. It now uses a solid green fill with white text (≈ 5.4:1).

**Still pending (needs your accounts):** CI run on GitHub, staging deploy (Vercel + Railway), demo PR, Sentry.

## Manual test steps for you

### A. Local (after installing Docker Desktop)

1. In PowerShell, at the project folder, follow `README.md` → _One-time setup_ steps 3–6.
2. Run `pnpm dev`. Wait until you see both `Ready` (storefront) and `Server is ready on port: 9000` (backend).
3. Open **http://localhost:3000** on your laptop.
   - ✅ You see **"Hello fitgaadi"**, the tagline, and a **green "Backend: connected"** badge.
   - ✅ The "What this page proves" box shows **₹1,25,000** (Indian lakh grouping).
4. Press **Tab** once. ✅ A yellow "Skip to content" button appears top-left.
5. Stop the backend only (close its terminal, or `Ctrl+C` and run just `pnpm --filter @autoparts/storefront dev`), refresh. ✅ The badge turns **red "Backend: not reachable"** and the page still works.
6. Open **http://localhost:9000/app** and log in with the admin user you created in step 6. ✅ Medusa dashboard opens. Go to **Settings → Regions** → ✅ "India" with currency **INR**. **Settings → Store** → ✅ name "FitGaadi".
7. On your phone (same Wi-Fi), open `http://<your-laptop-IP>:3000` (find the IP with `ipconfig`). ✅ Page is readable without zooming.

### B. GitHub (after the code is pushed)

8. Open the repo → **Actions** → ✅ latest "CI" run is green (5 jobs).
9. Open the demo pull request → ✅ green checks; after Vercel is connected, a **Preview** link.

### C. Staging (after Vercel + Railway are connected)

10. Open the staging URL on phone and laptop → ✅ same as step 3, with "connected".

**Exit criteria:** A + B pass on your machine; C passes once staging exists; you reply **"Phase 0 signed off"**. Then I tag `v0.1.0` and start Phase 1.
