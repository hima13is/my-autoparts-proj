# my-autoparts-proj: Product & Technical Plan (v0.1, draft for review)

> Status: **APPROVED on 5 Nov 2026.** Build Phase 0 signed off 9 Nov 2026 (`v0.1.0`). Build Phase 1 signed off 11 Nov 2026 (`v0.2.0`). Build Phase 2 in progress (tasks 1–7 of 7 done, 12 Nov 2026).
> Date: 5 Nov 2026 · Author: Claude (architect/designer) · Reviewer: project owner

## Decisions log

| Date | Decision | Effect on this plan |
|---|---|---|
| 5 Nov 2026 | Plan approved, start Phase 0 | n/a |
| 5 Nov 2026 | **Business model: drop-shipping from suppliers** (not own stock) | Adds a **Supplier** entity, per-supplier stock, supplier purchase orders, pickup from the supplier's address, delivery dates from the supplier's PIN, and returns to the supplier. See [`adr/0002-drop-shipping.md`](adr/0002-drop-shipping.md). Overrides assumption 9.2 #1. |
| 5 Nov 2026 | **GSTIN: owner will apply** | Build continues in Razorpay **test mode**. GSTIN (or Razorpay's no-GST onboarding route, if eligible) is needed before live payments and real GST invoices, so target it before the end of Build Phase 3. |
| 5 Nov 2026 | **Photos: suppliers will shoot and send** | Shared guide: [`supplier-photo-guide.md`](supplier-photo-guide.md). Photo permission is part of supplier onboarding. |
| 5 Nov 2026 | **Backend: Medusa** | Uses Medusa **2.22** via the maintained `dtc-starter` (the older default starter is deprecated). See [`adr/0001-tech-stack.md`](adr/0001-tech-stack.md). |
| 5 Nov 2026 | Money storage | Medusa stores prices in rupees as exact decimals (not integers in paise). The rule is now "no floating-point maths on money". |
| 9 Nov 2026 | **GitHub repo is public** | On the free GitHub plan, enforced branch protection and unlimited CI minutes need a public repo. No secrets are committed (gitleaks checks every PR). |
| 9 Nov 2026 | **Staging hosting** | Backend + Postgres on Railway in **Singapore** (closest region to India). Storefront on Vercel with functions in Singapore (`sin1`). Redis and Meilisearch are added when Phase 2 first needs them. No custom domain yet, so Cloudflare DNS waits. Railway Config as Code (`railway.json`) must move to `.railway/railway.ts` before 1 Dec 2026. |
| 9 Nov 2026 | **Sentry: errors only, no customer data** | Sentry 11.8 in both apps. All of Sentry's default data collection (user info, cookies, headers, bodies, SQL, stack variables) is switched off. No performance tracing yet. Source-map upload is planned for Phase 5. |
| 9 Nov 2026 | **PR merge policy** | The owner signs off phase PRs. Claude may merge maintenance PRs (Dependabot, small CI fixes) once CI is green, skipping versions released less than 2 weeks ago. React majors are ignored for the backend (Medusa admin needs React 18). |
| 9 Nov 2026 | **Design system** | `packages/ui` on native HTML elements (no component library). Storybook 10 stories double as accessibility tests, and screenshot baselines are made in the Playwright Linux Docker image. See [`adr/0003-design-system.md`](adr/0003-design-system.md). |
| 11 Nov 2026 | **Phase 2 data defaults** | Until supplier data arrives, the catalogue is realistic **seed data** (~30 Indian car models, 100–200 products). Supplier spreadsheets replace it later. The Shiprocket PIN check runs **behind a mock** until API credentials exist. |
| 11 Nov 2026 | **Product images: local storage until Phase 5** | Uses Medusa's default local file provider (files in the backend's `static/` folder). Railway's disk is reset on each deploy, so staging images are temporary. The storefront shows placeholders when a product has no image. Cloudflare R2 + CDN is set up in Phase 5. |
| 11 Nov 2026 | **Brands** | A `brand` module linked to products (one brand per product). Demo brand names are invented. |
| 11 Nov 2026 | **Search: Postgres, not Meilisearch** | Medusa 2.22's search module with its default Postgres provider meets the Phase 2 search tests (typos, synonyms, fits-my-car filter), so no Meilisearch service is needed. See [`adr/0004-search-postgres.md`](adr/0004-search-postgres.md). |

---

## Executive summary

We will build a **mobile-first Indian e-commerce store for car and SUV accessories**. Its main promise is **"it fits your car, guaranteed."** A shopper picks their car once (make → model → year → variant). After that, every page shows only accessories that fit it, with a green **"Fits your <car>"** badge.

| Topic | Recommendation |
|---|---|
| Brand name | **FitGaadi** (fitgaadi.com and fitgaadi.in both show no DNS registration; confirm with a registrar before buying) |
| Tagline | **"Sahi fit. Seedha ghar."** (The right fit, straight to your door.) |
| Frontend | Next.js (React + TypeScript) + Tailwind CSS, on Vercel |
| Backend | **Medusa v2**, an open-source Node.js commerce engine. It gives us cart, orders, promotions, inventory and an admin panel out of the box. We add a custom **Vehicle & Fitment** module. |
| Data | PostgreSQL (main database), Redis (cache and job queue), Meilisearch (fast typo-tolerant search) |
| Payments | **Razorpay** (UPI, cards, net banking, wallets, COD flagging). Backup option: Cashfree. |
| Shipping | **Shiprocket** aggregator (PIN-code serviceability, delivery-date estimates, labels, tracking) |
| Notifications | Email: Resend · SMS/OTP: MSG91 (DLT-registered) · WhatsApp: Meta Cloud API through Interakt or Gupshup |
| Repo | Monorepo (pnpm + Turborepo): `apps/storefront`, `apps/backend`, shared `packages/*` |
| Delivery | 6 build phases (0–5), about **10–12 weeks** in total. Every phase ends with automated tests, a manual test script for you, and your sign-off. |
| Starting cost | About **₹4,000–7,000/month** for infrastructure before transaction fees (details in §4) |

The biggest risk is not the code. It is **vehicle-fitment data**: India has no free, authoritative "which accessory fits which car" database. §9 explains how we de-risk it.

---

## 1. Branding and identity

### 1.1 Name candidates

I checked domain availability with a DNS lookup on 5 Nov 2026. "No DNS" strongly suggests the domain is unregistered, but it is **not proof**. Confirm on a registrar (GoDaddy, Namecheap or BigRock) and run a trademark search on the IP India portal (Class 35 retail and Class 12 vehicle accessories) before buying.

| # | Name | Rationale | .com | .in |
|---|---|---|---|---|
| 1 | **FitGaadi** ⭐ | Puts the core promise (fitment) together with the everyday Hindi word for car. Easy to say and remember. | No DNS ✅ | No DNS ✅ |
| 2 | **GaadiKit** | "Kit out your gaadi". Short and practical, but says less about fitment. | No DNS ✅ | No DNS ✅ |
| 3 | **GearSaathi** | "Saathi" means companion: a friendly helper for your car. | No DNS ✅ | No DNS ✅ |
| 4 | **ChakraKart** | Chakra (wheel) + kart (shopping). Has Indian roots, but "kart" is overused in Indian e-commerce. | No DNS ✅ | No DNS ✅ |
| 5 | **AutoAngan** | Angan (courtyard): a home for everything your car needs. Warm, but harder to spell. | No DNS ✅ | No DNS ✅ |
| 6 | **GaadiGhar** | "Home of the gaadi". Memorable, but could be mistaken for a used-car marketplace. | No DNS ✅ | No DNS ✅ |
| 7 | **WheelBandhu** | Bandhu (friend/brother). Has character but is long (11 letters). | No DNS ✅ | No DNS ✅ |
| 8 | **CarBandhu** | Shorter and clearer than #7. | Taken ❌ | No DNS ✅ |

Names I checked that were already taken: CarSaathi, Pahiya, Torqly, MotorWala, SahiFit, FitMyCar (.com), GaadiSaathi, KitMyCar (.com), GaadiGear (.com).

### 1.2 Recommendation

**FitGaadi: "Sahi fit. Seedha ghar."**

Why: the biggest frustration when buying car accessories online is *"will this actually fit my car?"* This name answers that question. It is 8 letters, sounds Indian, reads easily in English, and both domains appear free.

Alternative English tagline for ads: *"Accessories made for your car, not just any car."*

### 1.3 Visual direction

**Mood:** warm, confident, helpful. More "trusted neighbourhood mechanic who has a great shop" than "industrial parts catalogue".

**Colour palette** (every pairing below is checked for WCAG AA contrast):

| Role | Name | Hex | Use |
|---|---|---|---|
| Primary | Ink Teal | `#0E3B43` | Header, footer, headings, primary text on light backgrounds |
| Primary tint | Teal 600 | `#1D6672` | Links, hover states, active filters |
| Accent | Marigold | `#F2A93B` | Main CTA buttons ("Add to cart"), always with dark `#1A1A1A` text (contrast ≈ 9:1) |
| Success / fit | Fit Green | `#157A41` | "Fits your car" badge, in-stock text (≈ 5.4:1 on white) |
| Warning | Amber Ink | `#8A5A00` | "Check fitment", low-stock notes |
| Error | Brick | `#B42318` | Form errors, "Doesn't fit" |
| Background | Chai Cream | `#FAF7F2` | Page background (warmer than plain white) |
| Surface | White | `#FFFFFF` | Cards, inputs |
| Border | Sand | `#E5E0D8` | Dividers, card borders |
| Text | Charcoal | `#1A1A1A` | Body text |
| Muted text | Graphite | `#5C5C5C` | Secondary text (≈ 6.6:1 on white) |

**Typography** (all free Google Fonts):
- **Headings:** *Bricolage Grotesque*. It has character and a slight mechanical quirk, without looking like a generic template.
- **Body/UI:** *Noto Sans*. Very readable on low-end Android phones, and it has a matching **Noto Sans Devanagari**, so a Hindi version later will look consistent.
- **Part numbers and specs:** *IBM Plex Mono*, used sparingly.
- Base size 16px on mobile, 1.5 line height. Never smaller than 14px.

**Logo concept:** a lowercase wordmark **"fitgaadi"**. The dot of the "i" in *fit* becomes a small **check mark inside a circle**, which also reads as a tyre seen from the side. The app icon/favicon is that check-tyre on an Ink Teal square with Marigold detail.

**Iconography:** rounded 2px-stroke line icons (Lucide or Phosphor as the base set). We add a small custom set for categories: seat cover, floor mat, dashcam, car care, lighting, tyre inflator, perfume and so on, in the same stroke style.

**Imagery:** products on clean cream or white backgrounds, plus "on the car" photos where possible (the seat cover *inside* a Creta). Real Indian roads and cars in lifestyle banners. No stock photos of foreign cars.

**Tone of voice:**
- Plain, friendly and honest, like a knowledgeable friend. Short sentences.
- Light Hinglish only in headlines and micro-copy ("Sahi fit, guaranteed", "Aapki gaadi"). Product information stays in clear English.
- Honest about delivery: "Arrives **Thu, 12 Nov**" rather than "Fast delivery!"
- No fake urgency (no "Only 2 left!" unless it is true).

### 1.4 How this differs from the reference site (boodmo)

| Aspect | Reference site | FitGaadi |
|---|---|---|
| Focus | Mainly OEM/aftermarket **spare parts**, matched by part number | **Accessories** (comfort, care, tech, styling, protection) shopped by car and lifestyle |
| Feel | Dense, catalogue-like, aimed at people who know part numbers | Spacious, visual and guided, aimed at everyday car owners |
| Colour/brand | Its own palette and logo (we will not reuse them) | Warm Ink Teal + Marigold + cream, check-tyre logo |
| Navigation | Part-number and catalogue-tree driven | **"My Garage"** first: pick your car once, then everything is filtered for it |
| Content | Technical listings | "On my car" photos, fitment notes ("needs no drilling"), install difficulty, short how-to videos (later) |

We borrow only general e-commerce patterns that are common across the industry: vehicle selector, category browsing, search filters, cart and checkout. We copy no text, layout, images or assets.

---

## 2. Features: MVP vs later

> **Naming note:** "MVP / Phase 2 / Future" below are **feature tiers**. The build schedule in §7 uses **"Build Phase 0–5"** so the two don't get confused. MVP = everything shipped by the end of Build Phase 5 (launch).

### 2.1 Customer side

| Feature | MVP (launch) | Phase 2 (0–3 months after launch) | Future |
|---|---|---|---|
| **Home page** | Vehicle selector hero, top categories, best sellers, offers banner, trust strip (COD, returns, GST invoice) | Personalised "For your <car>" rails | Seasonal and editorial content, buying guides |
| **Vehicle selector** | Make → Model → Year → Variant (fuel/transmission/trim); saved to device and account ("My Garage", up to 3 cars) | Search by **registration number** (needs a paid vehicle-data API) | Pick your car from a photo |
| **Search** | Typo-tolerant instant search ("seet cvr" finds Seat covers), synonyms (mat = floor mat), filtered by the selected car | Hindi/Hinglish synonyms, "did you mean" | Voice search |
| **Filters** | Category, price, brand, rating, colour/material, "fits my car", in stock, COD available | Delivery-by-date filter | — |
| **Category pages** | Category tree (2 levels), sort, filter, pagination/"load more" | Car-specific landing pages for SEO (`/cars/hyundai/creta/seat-covers`), already partly in MVP | Shop-the-look bundles |
| **Product detail** | Gallery (zoom, pinch), price incl. GST, MRP and discount, fitment check panel, variant picker, PIN-code delivery date, COD eligibility, specs, what's in the box, returns summary | Q&A, install video, "frequently bought together" | 360° / AR view |
| **Cart** | Edit quantity, remove, save for later, coupon, price breakdown (item, GST, shipping, COD fee), fitment warning if an item doesn't fit the selected car | Abandoned-cart reminders | — |
| **Checkout** | Guest checkout with phone verification, address with PIN autofill of city/state, GSTIN field for business invoices, order summary | One-tap repeat address, saved UPI | — |
| **Payments** | Razorpay: UPI (intent + QR), cards, net banking, wallets; **COD** with an order cap (for example ≤ ₹5,000) and phone verification | Pay-later/EMI (via Razorpay), partial COD (prepaid advance) | Store credit/wallet |
| **Order tracking** | Order status timeline, courier AWB + live tracking link, GST invoice PDF download | In-page live map/tracking | — |
| **Account** | Login with **phone OTP** (fallback: email OTP / Google), profile, addresses, orders, My Garage | — | Loyalty points |
| **Wishlist** | Basic heart/save (account or device) | Price-drop alerts | Shareable lists |
| **Reviews** | Show ratings; **verified buyers** can rate and review with photos (moderated) | Review helpfulness votes, review-request emails | — |
| **Returns** | Request a return/replacement from the order page (reason + photo), pickup via courier, refund status | Instant refund to source for prepaid orders | Exchange for a different size |
| **Content/legal** | About, Contact, FAQ, Shipping, Returns, Privacy (DPDP-aligned), Terms, Grievance Officer | Blog/buying guides | Hindi site |

### 2.2 Admin side

| Feature | MVP | Phase 2 | Future |
|---|---|---|---|
| **Product & catalogue** | Create/edit products, variants (size/colour), images, prices (MRP, selling price), HSN code + GST rate, categories, brands, SEO fields; CSV bulk import/export | Scheduled price changes | Multi-seller marketplace |
| **Vehicle-compatibility mapping** | Manage makes/models/generations/variants; map a product to vehicles (by generation or by variant) with notes; "universal fit" flag; **CSV bulk fitment import** with a validation report | Copy fitment between similar products; data-quality dashboard (products without fitment) | Supplier fitment feeds/API |
| **Inventory** | Stock per variant, single warehouse, low-stock alert, stock reserved on order | Multiple warehouses, purchase orders | Supplier drop-shipping |
| **Orders** | List/filter, order detail, confirm, create shipment in Shiprocket, print label/invoice, cancel, refund | Bulk actions, RTO (return-to-origin) handling dashboard | — |
| **Returns** | Approve/reject, schedule pickup, refund | Auto-approval rules | — |
| **Customers** | List, detail, order history, block COD for abusers | Segments | CRM integration |
| **Coupons/promotions** | % or flat coupons, min order, usage limits, expiry, first-order coupon | Automatic promos (buy 2 get 10%), category- or car-specific offers | — |
| **Reports** | Sales by day, top products, orders by status, COD vs prepaid, GST summary export for your CA | Funnel analytics, cohort reports | — |
| **Staff & roles** | Admin + Staff roles, 2FA for admin | Fine-grained permissions | — |

### 2.3 Notifications

| Event | Email | SMS | WhatsApp |
|---|---|---|---|
| Login OTP | MVP (fallback) | **MVP** | Phase 2 |
| Order placed (with invoice) | **MVP** | **MVP** | Phase 2 |
| COD confirmation ("reply/press to confirm") | — | MVP | **Phase 2** (lowers fake COD orders) |
| Shipped (AWB + tracking link) | **MVP** | **MVP** | Phase 2 |
| Out for delivery / delivered | MVP | MVP | Phase 2 |
| Return/refund updates | **MVP** | MVP | Phase 2 |
| Abandoned cart / back in stock | Phase 2 | — | Phase 2 (opt-in only) |

WhatsApp is Phase 2 because it needs Meta Business verification and approved message templates, which take 1–3 weeks. SMS in India needs **DLT registration** (TRAI rules) before any message can be sent. We should start that paperwork in Build Phase 0.

---

## 3. Page-by-page UX

### 3.1 Site map

```mermaid
flowchart TD
  H[Home] --> VS[Vehicle selector / My Garage]
  H --> C[Category page]
  H --> S[Search results]
  VS --> CL["Car landing page<br/>/cars/make/model"]
  CL --> C
  C --> P[Product detail]
  S --> P
  P --> CA[Cart]
  CA --> CO[Checkout: login/phone → address → payment]
  CO --> OK[Order confirmation]
  OK --> OT[Order tracking]
  H --> AC[Account]
  AC --> AO[My orders] --> OT
  AO --> RT[Return request]
  AC --> AG[My Garage]
  AC --> AW[Wishlist]
  AC --> AA[Addresses]
  H --> INFO["Help/FAQ, Shipping, Returns,<br/>Privacy, Terms, Contact"]
```

**Admin:** Login → Dashboard → Products (list/edit) · Vehicles (makes/models/variants) · Fitment (map + CSV import) · Inventory · Orders · Returns · Customers · Promotions · Reports · Settings (tax, shipping, staff).

### 3.2 Screen inventory

| # | Screen | Key contents | Notes |
|---|---|---|---|
| 1 | **Home** | Header (logo, search, cart, account), "Select your car" hero card, category grid (8–12 icons), "Best for your car" rail, offers, trust strip, footer | If a car is saved, the hero becomes "Shopping for **Hyundai Creta 2021 SX Diesel** · change" |
| 2 | **Vehicle selector** (bottom sheet on mobile, modal on desktop) | 4 steps with big tap targets: Make (logos + search) → Model → Year → Variant; "Skip / show universal items" | One step per screen on mobile. Remembers choices. |
| 3 | **Car landing page** | "Accessories for Hyundai Creta (2020–2024)", categories with counts, best sellers for this car | Main SEO page |
| 4 | **Category page (PLP)** | Breadcrumb, car chip, filter button (sheet on mobile, sidebar on desktop), sort, product cards (image, name, rating, price, MRP strike, Fits badge, delivery date) | 2 columns on mobile, 4 on desktop |
| 5 | **Search results** | Same layout as PLP + query chips + "no results" helper (suggestions, WhatsApp us) | Instant dropdown while typing |
| 6 | **Product detail (PDP)** | Gallery, title, rating, price block, **Fitment panel**, variants, PIN-code check → "Get it by Thu 12 Nov · COD available", Add to cart (sticky on mobile), highlights, specs, in the box, returns, reviews | The fitment panel is the core of the page |
| 7 | **Cart** | Line items with fit status, quantity, remove, coupon, price breakdown, "Proceed to checkout" (sticky) | Fitment warnings are clear but don't block |
| 8 | **Checkout: identify** | Phone number → OTP (or continue with email) | Guests can check out after verifying their phone |
| 9 | **Checkout: address** | Saved addresses or new (PIN → auto city/state), optional GSTIN + business name | Re-checks serviceability live |
| 10 | **Checkout: payment** | UPI (top), cards, net banking, wallets, COD (with fee, if eligible), final summary, Pay button | Razorpay Checkout overlay |
| 11 | **Order confirmation** | Order number, delivery estimate, what's next, invoice link, "Track order" | Also sent by email/SMS |
| 12 | **Order tracking** | Timeline: Placed → Packed → Shipped → Out for delivery → Delivered; AWB + courier link | Accessible by link without login (signed token) |
| 13 | **Account home** | Orders, My Garage, Wishlist, Addresses, Profile, Logout | — |
| 14 | **Return request** | Pick items → reason → photos → refund method → pickup slot | Within the policy window only |
| 15 | **Wishlist** | Saved products with fit status for the current car | — |
| 16 | **Help/FAQ + policy pages** | Accordions, contact options (WhatsApp, email, phone hours) | — |
| 17 | **404 / error / offline** | Friendly message + search + home link | — |
| A1–A10 | **Admin screens** | Medusa Admin + custom pages for Vehicles, Fitment, Reports | §2.2 |

### 3.3 Low-fidelity wireframes (mobile first)

**Home (mobile, 360px)**
```
┌──────────────────────────────┐
│ ☰  fitgaadi        🔍  ♡  🛒2 │
├──────────────────────────────┤
│ ┌──────────────────────────┐ │
│ │ Find accessories that    │ │
│ │ FIT your car             │ │
│ │ [ Make      ▾ ]          │ │
│ │ [ Model     ▾ ]          │ │
│ │ [ Year ▾ ][ Variant ▾ ]  │ │
│ │ [  Show accessories  ▶ ] │ │  ← Marigold CTA
│ └──────────────────────────┘ │
│ Shop by category             │
│ [🪑Seat ] [🧽Care ] [📷Dash ] │
│ [💡Light] [🧩Mats ] [＋ More] │
│ ───────────────────────────  │
│ Best sellers for Creta  →    │
│ [card][card][card] ⇢ scroll  │
│ ───────────────────────────  │
│ ✓ COD  ✓ 7-day returns  ✓ GST│
└──────────────────────────────┘
```

**Category page (mobile)**
```
┌──────────────────────────────┐
│ ← Seat covers          🔍 🛒 │
│ 🚗 Creta 2021 SX D  [change] │
│ [⚙ Filters (2)] [⇅ Sort]     │
├──────────────┬───────────────┤
│ [  image   ] │ [  image   ]  │
│ Leatherette… │ Fabric 3D…    │
│ ★4.4 (210)   │ ★4.1 (88)     │
│ ₹3,499 ₹5,999│ ₹1,899        │
│ ✅ Fits Creta │ ✅ Fits Creta  │
│ Get it Thu   │ Get it Fri    │
└──────────────┴───────────────┘
```

**Product detail (mobile)**
```
┌──────────────────────────────┐
│ ←                    ♡  ⤴  🛒│
│ [    swipe gallery  ● ○ ○  ] │
│ BrandX Leatherette Seat Cover│
│ ★4.4 · 210 reviews           │
│ ₹3,499  ~~₹5,999~~  42% off  │
│ Incl. GST                    │
│ ┌ Fitment ─────────────────┐ │
│ │ ✅ Fits your Hyundai Creta│ │
│ │ 2021 SX Diesel            │ │
│ │ Note: not for 7-seater    │ │
│ │ [Check another car]       │ │
│ └──────────────────────────┘ │
│ Colour: (●Black)(○Beige)     │
│ Deliver to [ 560034 ] Check  │
│ 🚚 Get it by Thu 12 Nov · COD │
│ ▸ Highlights ▸ Specs ▸ Box   │
│ ▸ Returns  ▸ Reviews         │
├──────────────────────────────┤
│ ₹3,499   [  Add to cart   ]  │ ← sticky bar
└──────────────────────────────┘
```

**Checkout (3 short steps)**
```
 ① Phone → ② Address → ③ Pay
┌──────────────────────────────┐
│ ③ Payment                    │
│ (●) UPI  — GPay/PhonePe/Paytm│
│ ( ) Card                     │
│ ( ) Net banking              │
│ ( ) Cash on Delivery  +₹49   │
│ ──────────────────────────── │
│ Items ₹3,499 · Ship FREE     │
│ Total ₹3,499 (incl. GST)     │
│ [   Pay ₹3,499 securely   ]  │
└──────────────────────────────┘
```

**Desktop:** the same content in wider layouts. The home hero puts the selector on the left and a lifestyle image on the right. PLP has a filter sidebar + 4-column grid. PDP has the gallery on the left and the info/fitment/buy box on the right (sticky).

### 3.4 Main user journeys

**A. First-time buyer (mobile, "find a seat cover for my Creta")**: 3 clicks to the product:
```mermaid
journey
  title First-time buyer
  section Discover
    Lands on home from Google/Instagram: 3: Buyer
    Selects car Hyundai > Creta > 2021 > SX Diesel: 4: Buyer
    Taps "Seat covers" (click 1-2): 5: Buyer
  section Decide
    Sees only covers that fit, filters by price: 5: Buyer
    Opens product (click 3), sees Fits badge + delivery date: 5: Buyer
  section Buy
    Add to cart, checkout: 4: Buyer
    Verifies phone by OTP, enters address (PIN autofills city): 4: Buyer
    Pays by UPI: 5: Buyer
    Gets SMS + email with invoice: 5: Buyer
```

**B. Returning buyer**: opens site → car already remembered ("Shopping for Creta") → searches "dashcam" → filtered results → product → cart → saved address → UPI → done (≈ 60 seconds).

**C. Admin adding a product**
```mermaid
flowchart LR
  A[Admin login + 2FA] --> B[Products → New]
  B --> C[Title, brand, category,<br/>description, images]
  C --> D[Variants: colour/size,<br/>SKU, MRP, price, stock]
  D --> E[Tax: HSN code + GST rate]
  E --> F[Fitment tab: pick make/model/<br/>generation/variant or 'Universal'<br/>or upload CSV]
  F --> G[Preview on storefront]
  G --> H[Publish → search index updates<br/>automatically in seconds]
```

---

## 4. Tech stack

Simple explanation of each layer, the reason for the choice, and one alternative.

| Layer | Choice | What it is (plain language) | Why | Alternative |
|---|---|---|---|---|
| Frontend (storefront) | **Next.js** (React, TypeScript, App Router) + **Tailwind CSS** | The website the shopper sees. Next.js builds pages on the server, so they load fast and Google can read them. | Best-in-class SEO + speed; huge community; easy hosting | Remix / Astro |
| UI components | **Radix UI primitives** (via shadcn/ui pattern), custom-styled | Ready-made, **accessible** building blocks (dialogs, dropdowns) that we style ourselves | Gets WCAG keyboard/screen-reader support right without rebuilding it | React Aria |
| Backend (commerce engine) | **Medusa v2** (Node.js, TypeScript) | The "shop brain": products, prices, carts, orders, promotions, inventory, customers, plus a built-in **admin dashboard** | Saves months versus building from scratch; open-source (no licence fee, no lock-in); modular, so we can add our Vehicle/Fitment module | Custom NestJS + Prisma backend (full control, ~4–6 extra weeks); or Saleor (Python/GraphQL) |
| Database | **PostgreSQL** (managed: Neon or Railway) | Where all data is permanently stored | Reliable, relational (good for fitment mappings), Medusa's native database | MySQL / Supabase Postgres |
| Cache & job queue | **Redis** | Short-term memory: speeds up repeated requests and queues background jobs (send email, sync search) | Needed by Medusa in production; cheap | Upstash Redis (serverless) |
| Search | **Meilisearch** | A dedicated search engine that answers in under 50 ms, tolerates typos and filters by car | Free open-source, easy to run, great relevance for small and medium catalogues | Typesense / Algolia (paid, hosted) |
| Images & CDN | **Cloudflare R2** (storage) + **Cloudflare CDN** + Next.js image optimisation | R2 stores the original photos; the CDN delivers resized WebP/AVIF copies from servers close to the shopper (Mumbai, Chennai, Delhi) | Very cheap (no download fees), fast in India | Cloudinary (easier, costs more at scale) |
| Auth | **Medusa auth module** + **phone OTP via MSG91**; email OTP / Google as fallback | How users log in. Indians expect OTP over passwords. | No passwords to leak; fits Indian habits | Clerk / Firebase Auth |
| Payments | **Razorpay** | Payment gateway: shows UPI/cards/net banking, moves money to your bank account | Best UPI support, quick onboarding for small businesses, good docs; card data never touches our servers | **Cashfree** (lower fees on some methods, good payouts) or PayU |
| Shipping | **Shiprocket** | One account that talks to many couriers (Delhivery, Bluedart, Xpressbees…): PIN-code check, rates, labels, tracking, COD money collection | No need to sign contracts with each courier; COD remittance handled | Delhivery direct API / NimbusPost |
| Email | **Resend** (or Amazon SES later) | Sends order and invoice emails | Simple API, free tier (3,000/month) | Amazon SES (cheapest at volume) |
| SMS / OTP | **MSG91** | Sends OTP and order SMS, DLT-compliant | Indian provider, good OTP delivery rates | 2Factor / Gupshup |
| WhatsApp | **Meta WhatsApp Cloud API** via **Interakt** or **Gupshup** | Order updates on WhatsApp | Highest open rates in India | AiSensy / Wati |
| GST invoices | Generated in our backend (PDF) with HSN, CGST/SGST or IGST split | A legal tax invoice for every order | Full control; matches your GSTIN | Zoho Books / ClearTax integration (Phase 2) |
| Hosting: storefront | **Vercel** (Pro plan) | Runs the Next.js site worldwide; every pull request gets a preview link | Zero-config for Next.js; preview URLs let you click and test each change | Cloudflare Pages / Railway |
| Hosting: backend | **Railway** (Singapore region) running Medusa server + worker + Redis + Meilisearch + Postgres | Runs the "shop brain" and its helpers | One dashboard, cheap to start, scales by moving the slider | Render; later **AWS Mumbai** (ECS + RDS) when traffic grows |
| DNS/WAF | **Cloudflare** (free) | Domain address book + shield against bots/attacks | Free DDoS protection and SSL | AWS Route 53 + WAF |
| CI/CD | **GitHub Actions** | Robot that runs tests on every change and deploys when tests pass | Free for this scale, lives in the repo | GitLab CI |
| Monitoring | **Sentry** (errors) + **Better Stack** (uptime/logs) | Tells us when something breaks, before customers complain | Free tiers | Grafana Cloud |
| Analytics | **PostHog** (product analytics, funnels) + **GA4** (marketing) + Google Search Console | Shows where shoppers drop off | PostHog free tier is generous; GA4 for ads | Plausible |
| Testing | **Vitest** (unit), **Medusa integration test runner + Supertest** (API), **Playwright** (end-to-end + mobile viewports + screenshots), **axe-core** (accessibility), **Lighthouse CI** (performance), **k6** (load), **OWASP ZAP** (security scan) | Automated checks so we know each phase works | Industry standard, all free | Jest / Cypress |

**Estimated monthly cost at launch (low traffic)**

| Item | ≈ Cost/month |
|---|---|
| Vercel Pro (commercial use requires Pro) | $20 (~₹1,700) |
| Railway (backend + worker + Postgres + Redis + Meilisearch) | $20–45 (~₹1,700–3,800) |
| Cloudflare R2 + CDN | ₹0–300 |
| Resend, Sentry, PostHog, Better Stack | ₹0 (free tiers) |
| Domain (.com + .in) | ~₹150 (≈ ₹1,800/year) |
| MSG91 SMS | Pay per use, ~₹0.20–0.30 per SMS + one-time DLT fee |
| Razorpay | ~2% per transaction (UPI may be lower), no setup fee |
| Shiprocket | Per shipment (~₹30–80 for a 0.5 kg package, depends on zone) |
| **Total fixed** | **≈ ₹4,000–7,000/month** + per-order fees |

*(Prices are estimates. Confirm the current pricing pages before signing up.)*

---

## 5. System architecture

### 5.1 Architecture diagram

```mermaid
flowchart LR
  subgraph Users
    SH["Shopper<br/>(mobile / desktop browser)"]
    AD["Admin / staff"]
  end

  subgraph Edge["Cloudflare (DNS, SSL, WAF, CDN)"]
    CDN[CDN + Image cache]
  end

  subgraph Vercel
    SF["Storefront<br/>Next.js"]
  end

  subgraph Railway["Backend cloud (Railway → AWS later)"]
    API["Commerce API<br/>Medusa v2 server<br/>(+ Vehicle & Fitment module)"]
    ADM["Admin dashboard<br/>(Medusa Admin + custom pages)"]
    WK["Background worker<br/>(jobs & event subscribers)"]
    DB[("PostgreSQL")]
    RD[("Redis<br/>cache + queue")]
    MS["Meilisearch"]
  end

  R2[("Cloudflare R2<br/>product images, invoices")]

  subgraph External["Third-party services"]
    RZP[Razorpay]
    SR[Shiprocket]
    MSG[MSG91 SMS/OTP]
    RS[Resend Email]
    WA[WhatsApp API]
    OBS["Sentry / PostHog / Uptime"]
  end

  SH --> CDN --> SF
  AD --> ADM
  SF -- "REST /store/*" --> API
  SF -- "search-only key" --> MS
  ADM -- "REST /admin/*" --> API
  API --> DB
  API --> RD
  API -- "queues jobs" --> RD
  RD --> WK
  WK -- "sync products" --> MS
  WK --> RS & MSG & WA
  API <--> RZP
  RZP -- "webhook: payment.captured" --> API
  API <--> SR
  SR -- "webhook: status updates" --> API
  API --> R2
  CDN --> R2
  SF & API --> OBS
```

### 5.2 Every component in plain language

| Component | What it does | Why we need it | How it talks to others |
|---|---|---|---|
| **Cloudflare** | Front door for the domain. Gives HTTPS, blocks bad bots and serves cached files from a city near the shopper. | Speed and safety for free | Sits in front of the storefront and image storage. All traffic passes through it. |
| **Storefront (Next.js)** | Builds the pages shoppers see. Popular pages (home, category, product) are pre-built and refreshed every few minutes; cart and checkout are built live. | Fast pages = more sales and better Google ranking | Calls the Commerce API over HTTPS (JSON). Calls Meilisearch directly for instant search using a read-only key. Opens Razorpay's payment window in the browser. |
| **Commerce API (Medusa server)** | The rule-keeper: prices, stock, carts, orders, coupons, customers, taxes, and our **Vehicle & Fitment** rules ("does product X fit car Y?") | One trusted place where money and stock are calculated. The browser is never trusted to say what the price is. | Reads/writes PostgreSQL; uses Redis for caching; puts jobs on the queue; talks to Razorpay, Shiprocket and R2; receives webhooks. |
| **Vehicle & Fitment module** (custom, inside Medusa) | Stores the car tree (make → model → generation → variant) and the product ↔ vehicle mappings | This is our differentiator; no off-the-shelf module exists for Indian cars | Exposes `/store/vehicles/*` and `/admin/fitment/*` endpoints; adds a "fits" filter when listing products; feeds fitment data into the search index. |
| **Admin dashboard** | Web app for you and your staff to manage products, fitment, orders and so on | Lets you run the shop without touching code | Same Commerce API, admin-only routes `/admin/*`, login with 2FA. |
| **Background worker** | Does slow tasks outside the shopper's request: send emails/SMS, update the search index, generate invoice PDFs, sync courier status | Keeps checkout fast. If an email provider is slow, the shopper doesn't wait. Failed jobs are retried. | Picks jobs from Redis; writes results to PostgreSQL/R2; calls Resend/MSG91/WhatsApp/Meilisearch. |
| **PostgreSQL** | The permanent record: every product, order, customer and payment | Data must never be lost; daily backups + point-in-time restore | Only the API and worker connect, over a private, encrypted connection. |
| **Redis** | Fast short-term memory + job queue | Speeds up repeated lookups (e.g. the vehicle list); holds the job queue | API and worker connect privately. |
| **Meilisearch** | Search engine with typo tolerance, synonyms, facets ("brand: 3M (12)") and filtering by vehicle | A plain database search is slow and can't handle "seet cvr" | Worker pushes product updates to it; storefront queries it with a search-only key (it can read but not change anything). |
| **Cloudflare R2** | File storage for product images and invoice PDFs | Cheap, fast, no bandwidth fees | Admin uploads go via the API to R2; shoppers receive images through the CDN; invoices are shared with short-lived signed links. |
| **Razorpay** | Collects money (UPI/cards/net banking/wallets) and handles refunds | We must never handle card numbers ourselves (PCI DSS rules) | API creates a Razorpay *order* with the amount → browser opens Razorpay Checkout → Razorpay tells the API "paid" through a **signed webhook** → API marks the order paid. |
| **Shiprocket** | Checks whether a PIN code is deliverable and when, books couriers, prints labels, tracks parcels, collects COD cash | Honest delivery dates; one integration for many couriers | API calls Shiprocket for serviceability and to create shipments; Shiprocket sends tracking webhooks back. |
| **MSG91 / Resend / WhatsApp** | Delivers OTPs and order updates | Customers expect instant updates | Called only by the worker, using templates. |
| **Sentry / PostHog / Uptime** | Error alerts, usage analytics and uptime checks | We learn about problems before customers do | Small SDKs in storefront and backend. |
| **GitHub Actions** | Runs tests on every pull request; deploys after merge | Nothing broken reaches customers | Deploys storefront to Vercel and backend to Railway. |

**How a purchase flows, step by step:**
1. The shopper taps "Pay". The storefront asks the API to finalise the cart.
2. The API recalculates price, GST, shipping and coupon **on the server**, reserves stock, and creates a Razorpay order for that exact amount.
3. The Razorpay window opens and the shopper pays with UPI.
4. Razorpay sends a signed webhook to the API. The API verifies the signature and marks the order **Paid**.
5. The API puts jobs on the queue. The worker sends confirmation SMS/email, generates the GST invoice PDF and notifies the admin.
6. Admin clicks "Ship". The API books Shiprocket and gets the AWB number. Tracking webhooks keep updating the order timeline.

For COD, steps 3–4 are replaced by "COD eligibility check (PIN code, cart value, customer history) → order placed as *COD-pending* → confirmation SMS/WhatsApp".

### 5.3 Database design (main entities)

Medusa provides most commerce tables (product, variant, cart, order, payment, customer, promotion, inventory). We add **Vehicle**, **Fitment**, **Garage**, **Review**, **Wishlist**, **ReturnRequest extensions** and **Invoice**.

**The vehicle model, explained:** Indian cars change shape every few years. A "Swift 2015" and a "Swift 2021" take different seat covers. So we store:
- **Make** (Maruti Suzuki) → **Model** (Swift) → **Generation** (3rd gen, 2018–2023, hatchback) → **Variant** (VXi, Petrol, Manual).
- The shopper chooses a **year**, and we find the generation whose `year_from–year_to` includes it.
- **Fitment** links a product to a **generation** (most accessories) or a specific **variant** (for example, top-trim-only seat covers), with optional notes. Products marked **universal** fit every car.

```mermaid
erDiagram
  CUSTOMER ||--o{ ADDRESS : has
  CUSTOMER ||--o{ GARAGE_VEHICLE : saves
  CUSTOMER ||--o{ CART : owns
  CUSTOMER ||--o{ ORDER : places
  CUSTOMER ||--o{ REVIEW : writes
  CUSTOMER ||--o{ WISHLIST_ITEM : saves

  MAKE ||--o{ MODEL : has
  MODEL ||--o{ GENERATION : has
  GENERATION ||--o{ VEHICLE_VARIANT : has
  VEHICLE_VARIANT ||--o{ GARAGE_VEHICLE : "is saved as"

  CATEGORY ||--o{ CATEGORY : "parent of"
  CATEGORY ||--o{ PRODUCT : groups
  BRAND ||--o{ PRODUCT : makes
  PRODUCT ||--o{ PRODUCT_VARIANT : "sold as"
  PRODUCT ||--o{ PRODUCT_IMAGE : shows
  PRODUCT ||--o{ FITMENT : "fits via"
  GENERATION ||--o{ FITMENT : "matched by"
  VEHICLE_VARIANT ||--o{ FITMENT : "optionally narrowed to"
  PRODUCT_VARIANT ||--|| INVENTORY_ITEM : tracks
  SUPPLIER ||--o{ PRODUCT_VARIANT : "supplies (drop-ship)"
  SUPPLIER ||--o{ SUPPLIER_PO : receives
  ORDER ||--o{ SUPPLIER_PO : "split into"
  PRODUCT ||--o{ REVIEW : receives
  PRODUCT ||--o{ WISHLIST_ITEM : "saved in"

  CART ||--o{ LINE_ITEM : contains
  PRODUCT_VARIANT ||--o{ LINE_ITEM : "added as"
  CART ||--o| ORDER : "becomes"
  ORDER ||--o{ ORDER_ITEM : contains
  ORDER ||--o{ PAYMENT : "paid by"
  ORDER ||--o{ SHIPMENT : "shipped in"
  ORDER ||--o| INVOICE : "billed by"
  ORDER ||--o{ RETURN_REQUEST : "may have"
  PROMOTION ||--o{ ORDER : "applied to"

  MAKE { uuid id string name string slug string logo_url }
  MODEL { uuid id uuid make_id string name string slug string body_type }
  GENERATION { uuid id uuid model_id string name int year_from int year_to }
  VEHICLE_VARIANT { uuid id uuid generation_id string name string fuel string transmission int seats }
  PRODUCT { uuid id string title string slug uuid brand_id uuid category_id bool is_universal string hsn_code decimal gst_rate string status }
  PRODUCT_VARIANT { uuid id uuid product_id string sku string color string size int mrp_paise int price_paise }
  FITMENT { uuid id uuid product_id uuid generation_id uuid vehicle_variant_id_nullable string notes string position bool verified }
  GARAGE_VEHICLE { uuid id uuid customer_id uuid vehicle_variant_id int year string nickname bool is_default }
  ORDER { uuid id string display_no uuid customer_id string status string payment_mode int total_paise int tax_paise string gstin_nullable }
  PAYMENT { uuid id uuid order_id string provider string provider_ref string method string status int amount_paise }
  SHIPMENT { uuid id uuid order_id string courier string awb string status date eta }
  INVOICE { uuid id uuid order_id string invoice_no string place_of_supply int cgst int sgst int igst string pdf_url }
  REVIEW { uuid id uuid product_id uuid customer_id int rating string body bool verified_buyer string status }
  RETURN_REQUEST { uuid id uuid order_id string reason string status string refund_method }
  SUPPLIER { uuid id string name string gstin string pickup_pin string phone int dispatch_sla_days bool active }
  SUPPLIER_PO { uuid id uuid order_id uuid supplier_id string status datetime confirmed_at string awb }
```

*(Drop-shipping, added 5 Nov 2026: each product variant also stores `supplier_id` and `cost_price`. Each supplier gets its own stock location.)*

**Design rules:**
- ~~Money is stored as integers in paise.~~ *Updated:* Medusa stores money in rupees as exact decimals (BigNumber). We never do floating-point maths on money.
- Each product variant carries an **HSN code and GST rate**. The invoice uses **CGST + SGST** when the buyer is in your state and **IGST** otherwise. *(GST rates for car accessories were revised in 2025. We will configure them per HSN code and have your CA confirm.)*
- Fitment queries are indexed on `(generation_id)`, `(vehicle_variant_id)` and `(product_id)` so "show everything that fits a Creta 2021" stays fast.
- Soft-delete (archive) products instead of hard deletes, so old orders keep their history.

### 5.4 API design

**Style:** REST + JSON (Medusa's native style; simple to test and cache). Two groups: `/store/*` (public, shopper) and `/admin/*` (staff only). All admin routes require an authenticated session with a role. Webhooks live under `/hooks/*` and are signature-verified.

| Module | Endpoint | Purpose |
|---|---|---|
| **Vehicles** | `GET /store/vehicles/makes` | List makes (with logos) |
| | `GET /store/vehicles/makes/:makeId/models` | Models for a make |
| | `GET /store/vehicles/models/:modelId/years` | Available years |
| | `GET /store/vehicles/models/:modelId/variants?year=2021` | Variants for that year (resolves generation) |
| | `GET /store/vehicles/resolve?make=hyundai&model=creta&year=2021` | Slug → IDs for car landing pages |
| **Garage** | `GET/POST/DELETE /store/customers/me/garage` | Saved cars |
| **Catalogue** | `GET /store/products?category=seat-covers&vehicle_variant=…&sort=price_asc` | List with fitment filter |
| | `GET /store/products/:handle` | Product detail |
| | `GET /store/products/:id/fitment?vehicle_variant=…` | "Does it fit?" + notes |
| | `GET /store/product-categories` | Category tree |
| **Search** | Meilisearch `POST /indexes/products/search` (search-only key) | Instant search with `filter: fits = <generation_id> OR universal = true` |
| **Delivery** | `GET /store/delivery/serviceability?pin=560034&variant=…` | Deliverable?, ETA date, COD allowed? |
| **Cart** | `POST /store/carts` · `POST /store/carts/:id/line-items` · `POST /store/carts/:id/promotions` · `POST /store/carts/:id/shipping-methods` | Standard Medusa cart flow |
| **Checkout/Payment** | `POST /store/payment-collections` · `POST /store/carts/:id/complete` | Creates the Razorpay order, completes the cart into an order |
| **Auth** | `POST /auth/customer/otp/request` · `POST /auth/customer/otp/verify` | Phone OTP login (rate-limited) |
| **Orders** | `GET /store/orders` · `GET /store/orders/:id` · `GET /store/orders/:id/invoice` · `GET /store/track/:token` | History, invoice PDF, public tracking |
| **Returns** | `POST /store/orders/:id/return-requests` | Return/replacement request |
| **Reviews** | `GET /store/products/:id/reviews` · `POST /store/products/:id/reviews` | Read/write (verified buyers only) |
| **Wishlist** | `GET/POST/DELETE /store/customers/me/wishlist` | Saved items |
| **Admin: catalogue** | `/admin/products`, `/admin/product-categories`, `/admin/inventory-items` (Medusa built-in) | CRUD |
| **Admin: vehicles** | `GET/POST/PUT/DELETE /admin/vehicles/{makes,models,generations,variants}` | Manage the car tree |
| **Admin: fitment** | `GET/POST/DELETE /admin/products/:id/fitment` · `POST /admin/fitment/import` (CSV) · `GET /admin/fitment/import/:jobId` | Map products to cars, bulk import with validation report |
| **Admin: orders** | `/admin/orders`, `POST /admin/orders/:id/ship` (books Shiprocket), `/admin/returns` | Fulfilment |
| **Admin: promos** | `/admin/promotions` (built-in) | Coupons |
| **Admin: reports** | `GET /admin/reports/sales?from&to` · `GET /admin/reports/gst?month=2026-11` (CSV) | Reports and CA export |
| **Webhooks** | `POST /hooks/razorpay` · `POST /hooks/shiprocket` | Payment and shipping status, HMAC verified, idempotent |

### 5.5 Security

| Area | What we do |
|---|---|
| **Authentication** | OTP login (no passwords for customers); OTPs expire in 5 min, max 5 tries, rate-limited per phone and IP; HTTP-only, Secure, SameSite cookies; admin accounts need **2FA** and strong passwords; sessions expire. |
| **Authorisation** | Role-based access (Admin, Staff); every `/store/customers/me/*` and order route checks the order belongs to the logged-in user (prevents "change the ID in the URL" attacks). |
| **OWASP Top 10 basics** | A01 Broken access control → ownership checks + tests · A02 Crypto failures → TLS everywhere, encrypted DB at rest · A03 Injection → ORM with parameterised queries, input validation with Zod · A04 Insecure design → server-side pricing, threat model for checkout · A05 Misconfiguration → security headers (CSP, HSTS, X-Frame-Options), no default credentials · A06 Vulnerable components → Dependabot + `pnpm audit` in CI · A07 Auth failures → rate limits, lockouts · A08 Integrity → signed webhooks, lock files, CI-only deploys · A09 Logging → audit log for admin actions, Sentry alerts, no secrets/PII in logs · A10 SSRF → no user-supplied URLs fetched server-side; allow-list for outbound calls. |
| **Payment safety** | Razorpay hosted checkout, so card data never touches us (lowest PCI scope). The **amount is always computed on the server**. Verify the Razorpay payment signature *and* the webhook signature. Webhooks are **idempotent** (handling the same event twice does nothing). Nightly reconciliation job compares Razorpay settlements with orders. |
| **COD fraud** | Order-value cap, phone verification, block repeat RTO customers, optional WhatsApp confirmation. |
| **Secrets** | Never committed. `.env.example` lists names only. Real values live in GitHub Actions secrets, Vercel and Railway environment settings. Separate keys for dev/staging/prod; Razorpay **test keys** outside production; rotate on staff changes; `gitleaks` secret scanning in CI. |
| **Privacy (India DPDP Act 2023)** | Collect only what we need; clear consent for marketing messages; privacy notice; named Grievance Officer; ability to delete account/data; PII masked in admin lists where possible. |
| **Bots & abuse** | Cloudflare WAF + Turnstile (invisible CAPTCHA) on OTP and review forms. |
| **Backups** | Daily automated DB backups + point-in-time recovery; restore drill done in Build Phase 5. |

### 5.6 SEO and performance plan

**SEO**
- Server-rendered pages with clean URLs: `/c/seat-covers`, `/p/brandx-leatherette-seat-cover`, and car landing pages `/cars/hyundai/creta`, `/cars/hyundai/creta/seat-covers`. "Seat cover for Creta" is exactly what Indians type into Google.
- Unique titles and meta descriptions from templates ("Seat Covers for Hyundai Creta (2020–2024) | FitGaadi").
- **Structured data (schema.org):** Product, Offer (price in INR, availability), AggregateRating, BreadcrumbList, Organization, FAQ.
- Auto-generated `sitemap.xml` (products, categories, car pages) + `robots.txt`; canonical tags so filter/sort URLs don't create duplicates.
- Fast Core Web Vitals (a Google ranking factor); image alt text; Open Graph images for WhatsApp/social sharing.
- Google Search Console + Merchant Center (free Shopping listings) at launch.

**Performance budgets** (measured on a mid-range Android phone over 4G)

| Metric | Target |
|---|---|
| Largest Contentful Paint (LCP) | < 2.5 s (aim 1.8 s) |
| Interaction to Next Paint (INP) | < 200 ms |
| Cumulative Layout Shift (CLS) | < 0.1 |
| JavaScript per page (compressed) | < 170 KB |
| Search response | < 100 ms |
| Lighthouse mobile score | ≥ 90 performance, ≥ 95 accessibility, 100 SEO |

**How:** Incremental static regeneration (pre-built pages refreshed in the background), next/image with AVIF/WebP and correct sizes, fonts self-hosted and subset, minimal client JavaScript (React Server Components), Redis cache for vehicle lists, CDN caching, lazy-load below-the-fold rails, and Lighthouse CI that **fails the build** if budgets are broken.

---

## 6. Repository structure

### 6.1 Monorepo vs separate repos

**Recommendation: one monorepo** (`my-autoparts-proj`) using **pnpm workspaces + Turborepo**.

Why: storefront and backend share TypeScript types (for example `Product`, `Vehicle`), and one pull request can change both sides together. CI runs only what changed. It's also easier for one owner to manage than several repos. The alternative, separate repos, only pays off with separate teams.

```
my-autoparts-proj/
├── apps/
│   ├── storefront/            # Next.js shopper website
│   │   ├── src/app/           # routes: (shop)/, cars/, c/, p/, cart/, checkout/, account/
│   │   ├── src/components/    # page-level components
│   │   ├── src/lib/           # API client, search client, analytics
│   │   ├── e2e/               # Playwright end-to-end tests
│   │   └── public/
│   └── backend/               # Medusa v2 server + admin
│       ├── src/modules/
│       │   ├── vehicle/       # Make/Model/Generation/Variant + Fitment (custom)
│       │   ├── review/        # Reviews (custom)
│       │   ├── wishlist/      # Wishlist (custom)
│       │   └── invoice/       # GST invoice generation (custom)
│       ├── src/api/           # custom /store and /admin routes, /hooks webhooks
│       ├── src/workflows/     # multi-step business processes (checkout, returns)
│       ├── src/subscribers/   # event handlers (order.placed → send SMS)
│       ├── src/jobs/          # scheduled jobs (reconciliation, search re-index)
│       ├── src/admin/         # custom admin pages (Fitment mapper, Reports)
│       ├── src/integrations/  # razorpay, shiprocket, msg91, resend, whatsapp
│       ├── integration-tests/
│       └── medusa-config.ts
├── packages/
│   ├── ui/                    # design system: tokens, Button, Card, Sheet… (+ Storybook)
│   ├── types/                 # shared TypeScript types & Zod schemas
│   ├── config/                # shared eslint, tsconfig, tailwind preset, prettier
│   └── seed-data/             # vehicle tree CSVs, sample products, images list
├── infra/
│   ├── docker-compose.yml     # local Postgres, Redis, Meilisearch, Mailpit
│   └── railway/               # deployment notes/config
├── docs/
│   ├── PLAN.md                # this document
│   ├── adr/                   # architecture decision records (one page per big decision)
│   ├── runbooks/              # "how to refund", "how to restore backup"
│   └── test-plans/            # manual test scripts per phase
├── .github/
│   ├── workflows/ci.yml       # lint, typecheck, unit, integration, e2e, lighthouse
│   ├── workflows/deploy.yml
│   ├── pull_request_template.md
│   └── dependabot.yml
├── .env.example
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

### 6.2 Branching strategy

Simple **trunk-based** flow, suited to a small team:

```mermaid
gitGraph
  commit id: "phase-0 setup"
  branch feat/vehicle-selector
  commit id: "selector UI"
  commit id: "selector API + tests"
  checkout main
  merge feat/vehicle-selector tag: "auto-deploy → staging"
  branch fix/pin-check
  commit id: "fix"
  checkout main
  merge fix/pin-check
  commit id: "release" tag: "v0.2.0 → production"
```

- `main` is always deployable and **protected**: no direct pushes; a PR needs green CI + your approval.
- Short-lived branches: `feat/…`, `fix/…`, `chore/…`, `docs/…`, `test/…`.
- Every PR gets a **Vercel preview URL** you can click.
- Merge to `main` → auto-deploy to **staging**. A Git tag `vX.Y.Z` → deploy to **production**.
- One tag per completed build phase (`v0.1.0` = Phase 0 signed off, and so on).

### 6.3 Commit conventions

**Conventional Commits**, enforced by `commitlint` + `husky`:
`feat(storefront): add vehicle selector bottom sheet` · `fix(backend): verify razorpay webhook signature` · `test(e2e): checkout with UPI` · `docs: update plan`.
These messages also generate the CHANGELOG automatically.

### 6.4 Environment setup

**Three environments:** `local` (your laptop) → `staging` (test keys, fake data, shareable) → `production`.

`.env.example` (names only, never real values):
```
# --- Backend (apps/backend) ---
DATABASE_URL=postgres://user:pass@localhost:5432/fitgaadi
REDIS_URL=redis://localhost:6379
JWT_SECRET=
COOKIE_SECRET=
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_ADMIN_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
MSG91_AUTH_KEY=
MSG91_OTP_TEMPLATE_ID=
RESEND_API_KEY=
WHATSAPP_API_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
SELLER_GSTIN=
SELLER_STATE_CODE=
SENTRY_DSN=

# --- Storefront (apps/storefront) ---
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_MEILISEARCH_HOST=http://localhost:7700
NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Docker:** yes, for **local services only** (`infra/docker-compose.yml` runs Postgres, Redis, Meilisearch and Mailpit, a fake inbox for testing emails). The apps themselves run with `pnpm dev` for fast reloads. One command to start: `pnpm dev:all`.

**Your machine today:** Git ✅ (2.39), Node.js ✅ (v24), Python ✅. **Missing:** Docker Desktop, pnpm, GitHub CLI (`gh`). See §8.

---

## 7. Phased delivery plan (testing in every phase)

**Gate rule:** a phase starts only when the previous phase's automated tests are green in CI, you have run its manual test script, and you have replied "signed off". Each phase ends with a Git tag and a short demo note.

**Test pyramid used throughout:**
- **Unit tests (Vitest):** small pieces of logic, such as GST calculation and fitment matching.
- **Integration/API tests:** real API + test database, such as "adding to cart returns the right total".
- **End-to-end tests (Playwright):** a robot browser clicks through the real site on **mobile (Pixel 7, iPhone 14) and desktop** viewports.
- **UI checks:** screenshot comparison (visual regression), **axe** accessibility scan, Lighthouse performance.
- **Manual script:** exact steps for you to try yourself.

---

### Build Phase 0: Foundations & setup · ≈ 3–4 days

**Goal/scope:** an empty but working skeleton, live on staging, with CI guarding it.

**Tasks**
1. Install tools (pnpm via corepack, Docker Desktop, gh). Clone `my-autoparts-proj`.
2. Monorepo scaffold (Turborepo, pnpm workspaces, shared tsconfig/eslint/prettier).
3. Medusa v2 backend scaffold + Postgres/Redis/Meilisearch via docker-compose.
4. Next.js storefront scaffold with a "Hello FitGaadi" page calling the backend health endpoint.
5. GitHub Actions CI: install → lint → typecheck → unit → build; commitlint, gitleaks, Dependabot.
6. Staging deploy: Vercel (storefront) + Railway (backend, DB, Redis, Meilisearch). Cloudflare DNS for `staging.<domain>`.
7. Sentry wired up. `README` with setup steps; `.env.example`; ADR-001 (stack choice).
8. **Start the paperwork in parallel (you):** domain purchase, Razorpay account (test mode is instant), Shiprocket account, MSG91 + DLT registration, GSTIN details.

**Deliverables you can click**
- Staging URL showing "Hello FitGaadi" + "Backend: connected ✅".
- Medusa Admin login page on staging.
- A sample PR showing green CI checks and a Vercel preview link.

**Testing**
- Unit: one sample test per package (proves the test runner works).
- Integration: `GET /health` returns 200; DB migration runs on a fresh database.
- E2E: Playwright opens the staging home page on mobile + desktop and sees "Backend: connected".
- CI: a deliberately failing test blocks the merge (we demonstrate this once).

**Manual test steps for you**
1. Open the staging URL on your phone and laptop → you see "Hello FitGaadi" and a green "connected".
2. Open `<staging-api>/app` → admin login appears → log in with the credentials I give you.
3. Open the GitHub repo → Pull requests → open the demo PR → see green ticks and a "Preview" link → click it.
4. Follow `README.md` "Local setup" on your laptop: `pnpm install`, `pnpm dev:all` → open `http://localhost:3000`.

**Exit criteria:** CI green on `main`; staging live; local setup works from the README on your machine; no secrets in the repo (gitleaks clean). Tag `v0.1.0`.

> **Status: ✅ signed off 9 Nov 2026, tagged `v0.1.0`.** Report: [`test-plans/phase-0.md`](test-plans/phase-0.md).

---

### Build Phase 1: Brand & design system · ≈ 1 week

**Goal/scope:** the look and feel, built once and reused everywhere, plus a clickable prototype with dummy data.

**Tasks**
1. Logo files (SVG wordmark + icon + favicon set) and the final palette/type tokens in `packages/ui`.
2. Components: Button, IconButton, Input, Select, Checkbox, Radio, Badge (Fits/Doesn't fit/Check), Card, ProductCard, PriceBlock, Rating, BottomSheet/Modal, Tabs, Accordion, Toast, Skeleton loaders, Breadcrumb, Pagination, Header, Footer, VehicleSelector (UI only), EmptyState.
3. **Storybook** site showing every component in every state (default, hover, focus, disabled, error, loading).
4. Clickable prototype pages on staging with mock data: Home, Category, Product, Cart (no real data yet).
5. Accessibility baseline: focus rings, 44×44px tap targets, colour-contrast checks, reduced-motion support.

**Deliverables:** Storybook URL; prototype pages on staging (`/prototype/*`); a one-page brand sheet (PDF/PNG).

**Testing**
- Unit: component tests (renders, keyboard handling: e.g. the bottom sheet closes on Esc and returns focus).
- UI: **visual regression snapshots** of every component; **axe scan on every Storybook story = 0 violations**; contrast tokens verified automatically.
- Responsive: Playwright screenshots at 360, 390, 768, 1024 and 1440 px widths.
- E2E: keyboard-only walk through the prototype home → product.

**Manual test steps**
1. Open Storybook → click through Button, ProductCard and VehicleSelector → check colours, fonts and states look right to you.
2. On your phone open `/prototype` → scroll home → tap a category → tap a product → "Add to cart" (mock). Does it feel easy? Is anything too small?
3. On a laptop, use only **Tab / Shift+Tab / Enter / Esc** to go through the home page: you should always see where the focus is.
4. Turn your phone to landscape and use the largest font size in phone settings → nothing should overlap or be cut off.

**Exit criteria:** you approve the visual style; 0 axe violations; visual snapshots baselined; Lighthouse accessibility ≥ 95 on prototype pages. Tag `v0.2.0`.

> **Status: ✅ signed off 11 Nov 2026, tagged `v0.2.0`** ([PR #14](https://github.com/hima13is/my-autoparts-proj/pull/14)). All automated exit criteria are met: 0 axe violations (49 stories, 4 pages), 70 screenshot baselines, Lighthouse accessibility 98–100. Report: [`test-plans/phase-1.md`](test-plans/phase-1.md).

---

### Build Phase 2: Catalogue, vehicle selector & search · ≈ 2.5–3 weeks

**Goal/scope:** real products and real cars. A shopper can pick a car and find compatible accessories in ≤ 3 clicks.

**Tasks**
1. **Vehicle & Fitment module:** data model, migrations, `/store/vehicles/*`, `/admin/vehicles/*`.
2. **Seed data:** top ~30 car models sold in India (Maruti, Hyundai, Tata, Mahindra, Kia, Toyota, Honda…), with generations and variants; 100–200 sample products across 8–10 categories with fitment. *(Source to be agreed, see §9.)*
3. Categories, brands, product pages with real images from R2 + CDN.
4. Storefront: Home (live), Vehicle selector + **My Garage** (saved on device; account in Phase 3), Car landing pages, Category pages with filters/sort, PDP with fitment panel, 404 page.
5. Meilisearch indexing (on product save) with synonyms and typo tolerance; instant search dropdown + results page; "fits my car" filter.
6. PIN-code serviceability + delivery date on PDP (Shiprocket API, cached).
7. SEO basics: metadata, structured data, sitemap, canonical URLs.

**Deliverables:** staging site where you can select your own car, browse, search and open products; a public car page like `/cars/hyundai/creta`.

**Testing**
- Unit: fitment matching ("2021 maps to generation 2020–2024"; universal products always match; variant-specific fitment only matches that variant); slug generation; price/discount display.
- Integration/API: vehicle endpoints return the correct cascades; `GET /store/products?vehicle_variant=X` returns **only** fitting + universal items (seeded test fixture of 20 products with known answers); search index sync after a product edit; serviceability for valid/invalid PIN.
- E2E (mobile + desktop): select car → category → product in ≤ 3 clicks (the test counts the clicks); search "seet cvr" returns seat covers; change car → results update; car remembered after reload.
- UI: visual snapshots for PLP/PDP; axe = 0 violations; Lighthouse mobile ≥ 90 performance on Home, PLP, PDP.
- SEO: automated checks that each page has a title, meta description, canonical and valid JSON-LD (Google Rich Results test on 3 pages).

**Manual test steps**
1. On your phone open staging → "Select your car" → choose **your own car** → tap a category. Every product card should show ✅ "Fits your <car>" or be marked Universal.
2. Open any product → fitment panel says it fits → tap "Check another car" → pick a car it does *not* fit → you see a clear ❌ message.
3. Enter PIN **110001** (Delhi), then **000000** → you get a delivery date for the first and a "Sorry, we don't deliver here yet" message for the second.
4. Search for "dashcam", then "dash cam", then "dascam" → you get the same results each time.
5. Close the browser, reopen the site → your car is still selected.
6. Google "rich results test", paste one product URL → it shows Product with price and rating.

**Exit criteria:** all tests green; 3-click journey proven by E2E; performance budgets met; you've tried it with your own car. Tag `v0.3.0`.

> **Status (12 Nov 2026): in progress, [draft PR #16](https://github.com/hima13is/my-autoparts-proj/pull/16).**
> - ✅ **1. Vehicle & fitment module:** make → model → generation → variant; fitment for a generation, one variant, or universal. Store and admin APIs, plus fitment workflows that emit `fitment.changed`.
> - ✅ **2. Seed data:**
>   - the launch car list (7 makes, 34 models, 50 generations, 156 variants) is loaded by a migration script on every environment
>   - 121 demo products are loaded by a guarded script, on local/staging only
>   - the owner should review `apps/backend/src/data/vehicles.ts`
> - ✅ **3. Categories, brands, images:** a brand module; categories under Interior / Exterior & Care / Electronics; images on local storage with placeholders until Phase 5 (R2).
> - ✅ **4. Storefront:**
>   - vehicle selector and My Garage (on the device, mirrored to a cookie for server rendering)
>   - home, `/c/[handle]`, `/cars/[make]/[model]`, `/p/[handle]` (fit verdict, "check another car", the cars it fits)
>   - a branded 404; the Phase 0 page moved to `/status`
> - ✅ **5. Search:** Medusa's search module on Postgres instead of Meilisearch ([ADR 0004](adr/0004-search-postgres.md)). It handles typos and synonyms ("seet cvr", "dascam"), the fits-my-car filter, `/search`, and instant suggestions in the header.
> - ✅ **6. PIN-code delivery estimate:** `/store/delivery-estimate` with a zone-based mock until Shiprocket credentials exist; the product page remembers the last PIN.
> - ✅ **7. SEO basics:** titles, descriptions, absolute canonicals, Product + BreadcrumbList JSON-LD, sitemap.xml, and robots.txt (blocks indexing until `ALLOW_INDEXING=true` at launch).
> - ✅ **Manual test script:** [`test-plans/phase-2.md`](test-plans/phase-2.md).
> - ⏳ **Still to do:** the performance budget (local Lighthouse: home 90, category 76, product 67, car page 67; target 90) and staging (publishable key on Vercel, demo data on Railway).
>
> **Tests so far:** 75 backend unit tests, 41 backend integration tests (including the 20-product fit fixture), 24 storefront unit tests, 98 E2E tests on Pixel 7 / iPhone 14 / desktop with axe, and 55 Storybook stories with axe.

---

### Build Phase 3: Accounts, cart, checkout, payments & shipping · ≈ 2.5 weeks

**Goal/scope:** a real, end-to-end purchase in **test mode**: from cart to paid order, invoice and tracking.

**Tasks**
1. Phone OTP login (MSG91; email OTP fallback until DLT approval), account pages, addresses, My Garage synced to account, wishlist.
2. Cart (line items, fitment warnings, coupons, price breakdown with GST).
3. Checkout: identify → address (PIN autofill city/state, GSTIN optional) → shipping (rates/ETA from Shiprocket) → payment.
4. **Razorpay** integration: create order, Checkout overlay (UPI/cards/net banking/wallets), signature verification, webhooks, refunds; **COD** with rules (cap, PIN eligibility, fee).
5. Order placement workflow: stock reservation, order number, **GST invoice PDF** (CGST/SGST vs IGST), confirmation email + SMS.
6. Order history, order detail, public tracking page, return request flow (customer side).
7. Shiprocket shipment creation (triggered from admin) + tracking webhooks → timeline.

**Deliverables:** you can place real test orders on staging with Razorpay **test** UPI/cards and COD, get the email/SMS and invoice, and see tracking.

**Testing**
- Unit: GST calculation (intra-state vs inter-state, multiple HSN rates, coupon applied *before* tax, rounding in paise); COD eligibility rules; OTP expiry/attempt limits; invoice numbering (sequential, no gaps).
- Integration/API: full cart → order with test payment; **webhook signature rejected if tampered**; **same webhook twice = one payment** (idempotency); price tampering attempt (client sends a lower price) is ignored; user A cannot read user B's order (403); stock decreases once; out-of-stock blocks checkout.
- E2E (mobile + desktop): guest checkout with Razorpay test UPI success; card payment failure → friendly retry; COD order; logged-in returning buyer checkout with saved address; return request submission.
- UI: axe on cart/checkout = 0 violations; form errors announced to screen readers; checkout works at 360 px.
- Email rendering check in Mailpit (local) and real inbox (staging).

**Manual test steps** (Razorpay test mode, no real money)
1. Add 2 products to cart → apply coupon `TEST10` → check the price breakdown adds up.
2. Checkout as a new user → enter your phone → enter the OTP you receive → add an address with PIN **560034** → city/state fill themselves.
3. Pay with **UPI** using test VPA `success@razorpay` → confirmation page → check email + SMS → download invoice → check your GSTIN/state and the CGST+SGST/IGST split.
4. Place another order paying with UPI `failure@razorpay` → you should see a clear failure message and be able to retry; no order is confirmed.
5. Place a **COD** order above the cap (e.g. ₹6,000) → COD should be hidden/disabled with an explanation.
6. In admin, mark an order as shipped (Shiprocket test/sandbox) → open "Track order" link → timeline updates.
7. From "My orders", request a return with a photo → status shows "Requested".

**Exit criteria:** all tests green; 20 consecutive E2E checkout runs pass (no flaky tests); your manual run passes; your CA has seen a sample invoice. Tag `v0.4.0`.

---

### Build Phase 4: Admin, operations & notifications · ≈ 2 weeks

**Goal/scope:** you and your staff can run the business day-to-day without a developer.

**Tasks**
1. Admin custom pages: **Fitment mapper** (pick product → tick makes/models/generations/variants, or Universal), **CSV bulk import** for products and fitment with a downloadable error report, vehicle tree management.
2. Inventory: stock per variant, low-stock alerts, stock adjustments with reason.
3. Order operations: confirm, ship (Shiprocket), print label + invoice, cancel, refund (Razorpay), RTO handling, COD confirmation status.
4. Returns: approve/reject, schedule pickup, refund.
5. Customers: detail, history, block COD.
6. Promotions: coupons with rules.
7. Reports: sales, top products, COD vs prepaid, monthly **GST summary CSV** for your CA.
8. Staff roles + admin 2FA + **audit log** (who changed which price, when).
9. Review moderation. SMS templates via DLT; WhatsApp templates submitted (live in Phase 2 features if approval is slow).

**Deliverables:** an admin panel you can use to add a product with fitment in under 5 minutes; reports you can download.

**Testing**
- Unit: CSV parser and validator (bad make name, duplicate SKU, missing HSN, year outside range), report aggregations.
- Integration/API: staff role cannot access settings/refunds (403); CSV import of 500 rows completes and creates the exact expected fitment rows; refund API updates order + payment status; audit log entries created.
- E2E: the "admin adds a product" journey (§3.4 C) end-to-end and the product appears on the storefront search within 10 seconds; admin ships an order → customer sees tracking; admin refunds a return.
- UI: admin pages usable on a tablet (1024 px); axe on custom admin pages.

**Manual test steps**
1. Log into admin (with 2FA) → Products → New → create "Test Sun Shade" with 2 colours, prices, stock 10, HSN code, images → Fitment: map to **Maruti Swift 2018–2023** → Publish.
2. On the storefront, select Swift 2020 → the product appears with ✅. Select Creta → it does **not** appear.
3. Download the fitment CSV template → add 5 rows (include 1 deliberately wrong make) → upload → you get 4 imported + an error report for the bad row.
4. Create coupon `DIWALI15` (15%, min ₹999, 1 use per customer) → use it twice on the storefront → the second use is rejected.
5. Take a test order → ship it → cancel another → refund a third → check each status on the customer side.
6. Reports → download the GST CSV for this month → open it in Excel → totals match the orders you placed.
7. Log in as a **Staff** user → try to open Settings → access denied.

**Exit criteria:** all tests green; you add a product with fitment yourself without help; reports verified against test orders. Tag `v0.5.0`.

---

### Build Phase 5: Launch hardening & go-live · ≈ 1.5–2 weeks

**Goal/scope:** safe, fast, legal and monitored. Then production launch.

**Tasks**
1. Security: OWASP ZAP baseline scan, dependency audit, security headers/CSP, rate limits verified, secrets rotated for production, admin IP/2FA review, a `/security-review` pass on the full codebase.
2. Performance: Lighthouse CI on the top 10 pages, image audit, caching review; **k6 load test** (e.g. 200 concurrent shoppers browsing, 20 checkouts/min).
3. Accessibility: full WCAG 2.1 AA audit (automated + manual screen-reader pass with Android TalkBack and NVDA).
4. Legal & content pages: Privacy (DPDP), Terms, Shipping, Returns/Refunds, Grievance Officer, Contact; cookie/consent banner for analytics.
5. Analytics & SEO: PostHog funnels, GA4, Search Console, Merchant Center, sitemap submitted.
6. Ops: backups + **restore drill**, uptime alerts, error alerts to your phone/email, runbooks (refunds, failed payment, courier issue, restore).
7. Production setup: Razorpay **live** keys (after KYC), Shiprocket live, DLT live, production domain + SSL; real catalogue imported.
8. Soft launch to friends and family (10–20 real orders) → fix issues → public launch.

**Deliverables:** the live site on your domain; a launch checklist with every item ticked; a dashboard with orders, errors and uptime.

**Testing**
- Full regression: all unit + integration + E2E suites on production-like staging.
- Security: ZAP report with no High/Medium findings open; manual checks (IDOR, price tampering, webhook replay).
- Load: k6 thresholds (p95 page/API < 800 ms, 0% checkout errors).
- Accessibility: axe 0 violations site-wide + manual screen-reader script.
- Cross-browser/device: Chrome Android, Safari iOS, Samsung Internet, desktop Chrome/Edge/Firefox/Safari.
- Production smoke test: one **real ₹1 order** paid via UPI → refunded.

**Manual test steps**
1. On the **production** domain, place a real order for a cheap product with your own UPI → get SMS, email and invoice → refund it from admin → money returns to your account.
2. Turn on TalkBack (Android) → find a product for your car and add it to cart using only the screen reader.
3. Try the site on a family member's phone (different brand and browser) → complete a COD order.
4. Ask me to stop the backend on staging → you receive the downtime alert within 5 minutes.
5. Read each policy page and confirm the details (return window, contact, GST info) are correct.

**Exit criteria:** launch checklist 100%; your sign-off; tag `v1.0.0` → production.

---

### Timeline summary

| Phase | Effort | Cumulative |
|---|---|---|
| 0. Foundations | 3–4 days | Week 1 |
| 1. Design system | 1 week | Week 2 |
| 2. Catalogue & vehicle | 2.5–3 weeks | Week 5 |
| 3. Checkout & payments | 2.5 weeks | Week 7.5 |
| 4. Admin & ops | 2 weeks | Week 9.5 |
| 5. Launch hardening | 1.5–2 weeks | **Week 11–12** |

*Assumes steady work with me building and you reviewing within 1–2 days per phase. Paperwork (Razorpay KYC, DLT, Meta verification) runs in parallel from Phase 0 and is the most likely cause of delay. Product photography and fitment data are your side of the work.*

---

## 8. Skills and tools

### 8.1 What I will use (already available in this environment)

| Skill / tool | Used for | Phases |
|---|---|---|
| **frontend-design** skill | Distinctive, non-template visual design: design tokens, component styling, page layouts | 1, 2, 3 |
| **Playwright MCP** (browser automation plugin) | Driving a real browser to check pages, take screenshots at mobile/desktop sizes and debug E2E flows | 1–5 |
| **Claude in Chrome** | Looking at the live staging site the way you see it; reading console/network errors | 2–5 |
| **run** skill | Launching the app locally to verify changes actually work | 0–5 |
| **code-review** skill | Reviewing each phase's changes for bugs before you see them | 0–5 |
| **security-review** skill | Security pass on pending changes, especially auth, checkout and webhooks | 3, 4, 5 |
| **simplify** skill | Cleaning up code quality after each phase | 1–5 |
| **dataviz** skill | Charts in the admin reports page | 4 |
| **xlsx** skill | Building/validating the fitment and product CSV/Excel templates and the GST report format | 2, 4 |
| **pdf** skill | Checking the GST invoice PDF output | 3 |
| Core tools (file editing, shell, Git, Node.js) | Writing and running code and tests | All |

Testing libraries (Vitest, Playwright test runner, axe-core, Lighthouse CI, k6, OWASP ZAP) are project dependencies that I install inside the repo. You don't need to install them.

### 8.2 Missing tools you need to install (I won't work around these)

| Missing | What it's for | How to install (Windows) | Needed by |
|---|---|---|---|
| **Docker Desktop** | Runs the local database, Redis, search and fake-email services in containers | docker.com → Docker Desktop for Windows (needs WSL 2) | Phase 0 |
| **pnpm** | Package manager for the monorepo | Run `corepack enable` in a terminal (comes with Node.js) | Phase 0 |
| **GitHub CLI (`gh`)** | Lets me create branches/PRs, read CI results and set repo protections from here | `winget install GitHub.cli` then `gh auth login` | Phase 0 |
| *Optional:* **Anthropic `webapp-testing` skill** | Extra Playwright-based testing workflow for local web apps. The Playwright MCP already covers most of this, so it's nice to have, not required. | Install from Anthropic's skills repository | Phase 1+ |
| *Optional:* **Figma MCP / Figma account** | Only if you want design mock-ups in Figma before code. Otherwise I design directly in code + Storybook. | Figma Dev Mode MCP | Phase 1 |
| *Optional:* **PostgreSQL MCP** | Lets me query the staging database directly when debugging | Any Postgres MCP server | Phase 2+ |

Your current machine: Git 2.39 ✅, Node.js 24 ✅, Python 3.12 ✅. Docker, pnpm and gh were **not found**.

---

## 9. Risks, assumptions and open questions

### 9.1 Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Vehicle-fitment data**: no free authoritative India database | Wrong "fits" claims → returns, bad reviews | **High** | Start with the top 30 models (≈ 80% of cars on Indian roads); get fitment from suppliers/brands per product; mark mappings "verified" only after checking; "Fit guarantee: free return if it doesn't fit"; let customers report fit issues; evaluate paid data vendors later. |
| **Payment gateway approval** (Razorpay KYC needs a business entity, bank account, GSTIN, live website with policies) | Can't take live payments | Medium | Apply in Phase 0; build entirely in test mode; keep Cashfree as a backup application; policy pages ready early. |
| **SMS DLT registration** (TRAI) takes 1–3 weeks | No OTP/SMS | Medium | Start in Phase 0; email OTP + Google login as fallback. |
| **WhatsApp Business verification** | No WhatsApp updates at launch | Medium | Moved to Phase 2 features; SMS + email at launch. |
| **Product images** (quality, rights) | Low conversion; copyright issues if images are taken from other sites | High | Use supplier-provided images with written permission + own photos for top sellers; never scrape other sites' images; image guidelines (white background, 1:1, ≥ 1200 px). |
| **COD fraud / RTO** (returned undelivered parcels cost both-way shipping) | Margin loss | High in India | COD cap, phone verification, WhatsApp confirm, block repeat offenders, small COD fee, prepaid discount. |
| **GST correctness** (rates per HSN, place-of-supply rules) | Legal/tax exposure | Medium | Configurable per HSN; CA reviews invoice and report in Phase 3. |
| **Medusa v2 learning curve / plugin gaps** (e.g. Razorpay plugin maturity) | Delay in Phase 3 | Medium | Write our own thin Razorpay provider (well-documented API); ADR to decide; fallback = custom backend. |
| **Scope creep** | Launch slips | Medium | Strict MVP list (§2); new ideas go to the Phase 2 backlog. |
| **Trademark conflict with chosen name** | Forced rebrand later | Low–Medium | IP India search + domain/social handle check before buying. |
| **Courier coverage & delivery-date accuracy** | Broken promises | Medium | Use Shiprocket ETA + your own packing buffer (e.g. +1 day); show dates, not "fast". |

### 9.2 Assumptions I made (please correct any that are wrong)

1. **Single seller:** you (one business) sell your own stock from **one warehouse**. Not a marketplace with many sellers.
2. Launch catalogue of roughly **300–2,000 SKUs** across 8–12 accessory categories (not engine/OEM spare parts).
3. **Pan-India shipping** through a courier aggregator. No own delivery fleet.
4. **English-first** website; Hindi later.
5. You have (or will register) a business with **GSTIN** and a current account, needed for Razorpay and GST invoices.
6. A **web app** only (mobile-responsive website, installable as a PWA). No native Android/iOS apps in the MVP.
7. Fitment level: make → model → **generation (year range)** → variant. Not per-VIN or per-registration lookup at launch.
8. Starting traffic is modest (hundreds to a few thousand visitors per day); the architecture can scale beyond that without a rewrite.
9. I build; you review, test each phase with the manual script, and supply business details, product data and images.

### 9.3 Questions for you before we start

1. **Brand:** do you approve **FitGaadi** (or pick another from §1.1)? Should I also check Instagram/Facebook handle availability?
2. **Business model:** single seller with your own inventory (as assumed), or drop-shipping from suppliers, or a multi-seller marketplace later? *(This changes the architecture the most.)*
3. **Business registration:** do you already have a GSTIN, a business PAN and a current account? Which **state** are you registered in (needed for the CGST/SGST vs IGST split)?
4. **Catalogue:** roughly how many products at launch, which categories, and where do product data and fitment information come from (your suppliers, brands, a spreadsheet you already have)?
5. **Images:** do you have product photos or supplier permission, or do we need a photography plan?
6. **Backend choice:** are you happy with **Medusa** (faster, open-source, admin included), or do you prefer a **fully custom backend** (more control, ~4–6 weeks extra)?
7. **Policies:** return window (7 days? 10?), free-shipping threshold, COD fee and COD order cap?
8. **Shipping:** any existing courier contract, or start with Shiprocket?
9. **Budget:** is ≈ ₹4,000–7,000/month for infrastructure at launch acceptable?
10. **Languages:** English only at launch, with Hindi in Phase 2, OK?
11. **Your role:** will you maintain the code yourself later, or hand it to a developer? (This affects how much documentation and how many ADRs I write.)
12. **Target launch date** or a festival season you want to hit?
13. **GitHub:** is `my-autoparts-proj` under your personal account (what's the URL)? Should I connect this folder to it in Phase 0?

---

**Awaiting your review. Reply with changes or 'Approved – start Phase 0'.**
