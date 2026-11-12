# Build Phase 2: Test report & manual test script

## What was built

- **Cars and fitment:** make → model → generation → variant for 34 Indian car models (7 makes, 156 variants). A product can fit a whole generation, one variant, or every car ("universal").
- **Demo catalogue:** 121 products with invented brands across Interior, Exterior & Care and Electronics. Local and staging only; supplier data replaces it later.
- **Storefront:**
  - vehicle selector and **My Garage**, remembered on the device
  - home, category pages (`/c/seat-covers`), car pages (`/cars/hyundai/creta`) and product pages, with a fit verdict and "Check another car"
  - search with typo tolerance and instant suggestions, plus a "fits my car" filter
  - delivery estimate by PIN code, a branded 404 page, and SEO basics (structured data, sitemap, robots.txt)
- **Search** runs on Medusa's search module with Postgres instead of Meilisearch ([ADR 0004](../adr/0004-search-postgres.md)).
- **Delivery estimates** come from a stand-in (mock) with realistic times by region until Shiprocket credentials exist.

## Links

| What         | URL                                                   |
| ------------ | ----------------------------------------------------- |
| Storefront   | https://fitgaadi-storefront.vercel.app                |
| Storybook    | https://fitgaadi-storybook.vercel.app                 |
| Pull request | https://github.com/hima13is/my-autoparts-proj/pull/16 |

> Staging needs real data before the manual steps below work there: the storefront's publishable key on Vercel and the demo catalogue on Railway. Until then, run them locally (`pnpm dev`).

## Automated results (12 Nov 2026)

| Check                               | Result                                                                                                                                                                                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend unit tests                  | ✅ fitment rules ("2021 maps to the 2020–present generation", universal and variant-only rules), slugs, search keywords, delivery dates (Sundays skipped, India time)                                                             |
| Backend integration tests           | ✅ vehicle cascades, admin CRUD, fitment workflows, brands, the **20-product fit fixture** (`?fits_variant_id=` returns only fitting + universal items), delivery estimate for 110001 / 000000 / bad input                        |
| Storefront unit tests               | ✅ 47 (garage, car cookie, listing sort/paging, search, delivery text, SEO builders)                                                                                                                                              |
| E2E (Pixel 7, iPhone 14, desktop)   | ✅ 3-click journey (the test counts the clicks), "seet cvr" and "dascam" find the right products, car remembered after reload, change car → results update, delivery check, SEO metadata, axe = 0 violations on every page tested |
| Storybook stories with axe          | ✅ 55 stories, 0 violations                                                                                                                                                                                                       |
| Visual regression                   | ✅ baselines for the new UI (search box, fit badge states)                                                                                                                                                                        |
| SEO                                 | ✅ title, description and absolute canonical on home, category, car and product pages; valid Product + BreadcrumbList JSON-LD; sitemap.xml; robots.txt blocks indexing until `ALLOW_INDEXING=true`                                |
| Lighthouse (local, throttled phone) | ⚠️ performance 90 / 76 / 67 / 67 (home / category / product / car page) against a target of 90; accessibility 98–100. See "Open items".                                                                                           |

**Bugs found by the tests and fixed:**

- Category pages could show a product on page 1 for one request and page 2 for the next. Demo products share a creation time, and Postgres returns ties in any order. Lists are now sorted newest first, then by name. (The catalogue E2E tests had been failing at random in CI.)
- A test file inside `apps/backend/src/search/` broke database migrations in CI, because Medusa loads every file in that folder at boot. Tests now live elsewhere.
- Cache lifetimes of "seconds" in the offline fallbacks made the build fail without a backend. They now use "minutes".
- Text typed into the search box before the page finished loading was lost. The box no longer resets it.

## Manual test steps for you

Use your phone for A–D and a laptop for E.

### A. Your car

1. Open the storefront → **Select your car** → choose **your own car**. ✅ The header shows your car.
2. Tap a category (e.g. Seat covers). ✅ Every product card says **"Fits your …"** or **"Fits all cars"**.
3. Close the browser and open the site again. ✅ Your car is still selected.

### B. Product page

4. Open any product. ✅ "Will it fit?" says it fits.
5. Tap **Check another car** → pick a car it does _not_ fit. ✅ A clear ❌ "doesn't fit" message, and the list of cars it does fit.
6. Under **Delivery**, enter **110001** → **Check**. ✅ "Delivery to 110001 between …" and "Cash on delivery is available."
7. Enter **000000** → **Check**. ✅ "Sorry, we don't deliver to 000000 yet."
8. Open another product. ✅ The PIN code is filled in and checked already.

### C. Search

9. Search for **dashcam**, then **dash cam**, then **dascam**. ✅ You get the same dashcams each time.
10. Type **seet** slowly in the search box. ✅ Suggestions appear as you type.

### D. Car pages and errors

11. Open `/cars/hyundai/creta`. ✅ Creta accessories, with a year picker.
12. Open `/p/does-not-exist`. ✅ A friendly "not found" page with a way back.

### E. SEO (once staging is public)

13. Search Google for "rich results test" and paste a product URL. ✅ It shows **Product** with its price. A rating appears only once product reviews exist (a later phase).
14. Open `/sitemap.xml`. ✅ It lists categories, car pages and products.

## Open items

- **Performance below target on category, product and car pages.** The main cost is JavaScript start-up (about 1.2 s of script time on a throttled phone). Not yet profiled: a likely candidate is the full car list that the shop layout sends to every page for the selector. Decide whether to do this now or in Phase 5.
- **Shiprocket:** swap the mock for the real API, with caching, once credentials exist.
- **Product photos** use placeholders until Phase 5 (Cloudflare R2).
