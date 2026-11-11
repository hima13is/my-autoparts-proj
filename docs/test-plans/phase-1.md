# Build Phase 1: Test report & manual test script

## What was built

- **`packages/ui`**: the FitGaadi design system:
  - brand tokens (colours, fonts, radii, 44px tap size)
  - logo, app icon and favicons
  - 22 components and patterns
  - Storybook with 49 stories
- **`/prototype`** on the storefront: Home, Category, Product and Cart, clickable, with made-up products and prices (hidden from search engines).
- **Brand sheet:** [`docs/brand/brand-sheet.pdf`](../brand/brand-sheet.pdf) (also `.png`).

## Links

| What         | URL                                                   |
| ------------ | ----------------------------------------------------- |
| Prototype    | https://fitgaadi-storefront.vercel.app/prototype      |
| Storybook    | https://fitgaadi-storybook.vercel.app                 |
| Pull request | https://github.com/hima13is/my-autoparts-proj/pull/14 |

## Automated results (9 Nov 2026)

| Check                                   | Result                                                                                                                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit tests (`pnpm test`)                | ✅ 83 passed (ui 60 · shared 7 · storefront 7 · backend 9)                                                                                                                                     |
| Colour contrast                         | ✅ every text pairing used ≥ 4.5:1, every control outline/focus ring ≥ 3:1 (unit-tested from `tokens.ts`)                                                                                      |
| Storybook stories as tests, axe = error | ✅ 49/49 in Chromium, 0 violations; includes interaction tests (Esc closes the sheet and returns focus, arrow keys in tabs, toast announced, full vehicle-selector flow)                       |
| E2E (Pixel 7, iPhone 14, desktop)       | ✅ 47 passed, 7 skipped by design. Axe on all 4 prototype pages, car-fit journey, selector sheet with search, cart, PIN validation, keyboard-only walk, 44px tap targets                       |
| Visual regression                       | ✅ 70 baselines (49 stories + 4 pages × 5 widths: 360/390/768/1024/1440), re-checked identical in a fresh Linux container                                                                      |
| Lighthouse (CI, throttled phone)        | ✅ accessibility 100 / 98 / 100 / 100 (home / category / product / cart). Performance 73 / 85 / 84 / 92, a warning only (target 80); home is slowest (780 ms blocking time), to fix in Phase 5 |
| CI on PR #14                            | ✅ all 8 jobs green (5 existing + design system, visual regression, Lighthouse; all now required on `main`)                                                                                    |
| Lint · typecheck · build                | ✅ 0 problems                                                                                                                                                                                  |

**Bugs found by the tests and fixed:**

- The cart icon button's name was set in a way axe flags as not matching its visible count. It now uses screen-reader text.
- The bottom sheet didn't return focus after closing. React removes event listeners before re-adding them, so the close event was missed. Focus is now restored directly.
- The bottom sheet relied on the browser's own Esc handling, which some browsers skip. Esc is now handled explicitly.
- The 16px favicon preview rendered at 32px: two size classes fought over the same element. Defaults now apply only when no size is passed.

## Manual test steps for you

### A. Storybook (laptop)

1. Open https://fitgaadi-storybook.vercel.app → **Brand → Brand sheet**. ✅ Do the logo, colours and fonts feel right for FitGaadi? Note anything you'd change.
2. **Components → Button**: click through Primary, Secondary, Loading, Disabled. ✅ The Marigold button always has dark text.
3. **Components → ProductCard → Grid**. ✅ Cards are easy to scan (price, discount, fit badge, delivery date).
4. **Patterns → Vehicle selector → Step By Step Sheet**: click "Select your car", type "hyun", pick Hyundai → Creta → 2021 → SX Diesel. ✅ The chip shows "Hyundai Creta 2021 SX Diesel".
5. Open the **Accessibility** tab at the bottom of any story. ✅ "0 violations".

### B. Prototype on your phone

6. Open https://fitgaadi-storefront.vercel.app/prototype. ✅ A Marigold strip says it's a prototype.
7. In "Select your car" pick a make, model and year → **Show accessories**. ✅ You land on Seat covers, the top strip says "Shopping for …", and cards say **"Fits Creta"** (one dashcam says "Check fitment", the LED bulbs say "Doesn't fit").
8. Tap **Filters**. ✅ A sheet slides up from the bottom; close it with the ✕.
9. Tap a product → enter PIN **560034** → **Check**. ✅ "Get it by Thu, 12 Nov · Cash on delivery available". Try **1234**. ✅ A red error appears.
10. Scroll: ✅ the price + **Add to cart** bar stays at the bottom. Tap it. ✅ "Added to cart" appears and the cart icon shows **1**.
11. Open the cart. ✅ The item, quantity, price breakdown (MRP, discount, shipping, total). Remove it. ✅ "Your cart is empty".
12. Does it feel easy? Is anything too small to tap or hard to read?

### C. Keyboard & accessibility (laptop)

13. On the prototype home page use only **Tab / Shift+Tab / Enter / Esc**. ✅ You can always see where you are (dark outline; Marigold outline on dark areas).
14. Open the filters sheet with Enter, press **Esc**. ✅ It closes and focus returns to the Filters button.
15. Phone: landscape, plus the largest font size in phone settings. ✅ Nothing overlaps or gets cut off.

**Exit criteria:** you approve the visual style. Then reply **"Phase 1 signed off"** (with any changes you want first). Then I merge PR #14 and tag `v0.2.0`.

## Notes and follow-ups

- Demo brands, products, prices and ratings are made up and appear only under `/prototype`.
- The prototype cart and car choice are saved in the browser only. Real carts and accounts arrive in Phases 2–3.
- Updating screenshot baselines after an intended visual change: `bash scripts/visual-baselines.sh` (needs Docker), review the PNGs, commit.
- Performance: the prototype home page scores 73 on Lighthouse's throttled phone test (blocking time 780 ms). Phase 5 (launch hardening) covers this.
- Still open from Phase 0: migrate Railway's `railway.json` to `.railway/railway.ts` before 1 Dec 2026.
