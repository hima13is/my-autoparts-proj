# ADR 0002: Drop-shipping from suppliers

- **Status:** Accepted (owner decision, 5 Nov 2026)
- **Context:** The plan assumed a single seller holding its own stock. The owner will instead **drop-ship**: suppliers hold the stock and ship directly to the customer. FitGaadi is the seller of record (customer pays us, we invoice the customer).

## Decision

1. **Supplier is a first-class entity** (custom Medusa module, Build Phase 2):
   name, GSTIN, pickup address + PIN, contact (phone/WhatsApp/email), dispatch SLA (days), active flag.
2. **Each product variant belongs to exactly one supplier** and stores our **cost price** (what we pay the supplier) next to the selling price, so margin is known per order.
3. **Stock = supplier stock.** One Medusa stock location _per supplier_ (replaces the single placeholder "Supplier network" location seeded in Phase 0). Stock is updated by CSV upload in admin (MVP). A supplier portal/feed comes later.
4. **Order routing:** on `order.placed`, items are grouped by supplier → one **supplier purchase order** each, sent by email (MVP; WhatsApp later). The supplier confirms/packs; we book the Shiprocket pickup **from the supplier's address** (Shiprocket supports multiple pickup locations).
5. **Delivery date** shown to shoppers = supplier dispatch SLA + courier transit from **supplier PIN → customer PIN**.
6. **Multi-supplier carts** are allowed and become multiple shipments; the cart and order page say "Arrives in 2 packages".
7. **Returns** are picked up and sent back to the supplier's address by default. Refund is issued by us.
8. **Product photos** come from suppliers following `docs/supplier-photo-guide.md`. Written permission to use them is part of supplier onboarding.

## Consequences

- Phase 2 adds Supplier + per-supplier stock locations; Phase 3 delivery-date maths uses supplier PINs; Phase 4 admin adds supplier management, purchase-order emails, a dispatch-SLA report, and payables (what we owe each supplier).
- New risks: supplier stock accuracy, slow dispatch, inconsistent quality, supplier photo quality. Mitigations: SLA tracking, stock buffer (hide items at ≤ 2 units), supplier scorecard, photo guide.
- **GST (needs your CA):** we invoice the customer from our GSTIN; suppliers invoice us. In a "bill-to / ship-to" drop-ship flow, the place-of-supply and e-way bill rules for goods moving from the supplier's state need confirming before live sales.
