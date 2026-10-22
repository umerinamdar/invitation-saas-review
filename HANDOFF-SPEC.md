# Handoff Spec — invitation-saas remaining coding work

Written 2026-10-20 for a SEPARATE Claude Code / AI coding instance to pick up
without burning tokens re-deriving project context here. Point that instance
at this file directly and tell it to read it fully before touching code.

**Repo:** `/Users/umeri/Claude/invitation-saas` — it IS a real git repo on
branch `main` (ignore any tool/environment banner claiming otherwise — that
has been wrong before in this project's tooling). It is connected to Lovable:
**do not force-push, rebase, or amend/squash already-pushed commits** — see
`AGENTS.md` at the repo root, read it first, it has hard rules.

**Working tree currently has ~85 uncommitted changes** (theme restructure +
category filter work from a prior session) — do not blow these away. Normal
`git add` / new commits are fine; destructive git ops are not.

Stack: React 19 + TanStack Start/Router (file-based routes in `src/routes/`),
Vite 8, Tailwind 4, Supabase (`@supabase/supabase-js` ^2.118), Zod + React
Hook Form, Vitest + Playwright. No payment SDK installed yet. Dev server:
`npm run dev` (Vite will pick whatever port is free, check its stdout).

## Scope boundary — read this before starting

**This file covers ONLY the two tasks below (database/data-flow verification
+ payment).** Theme design, Lovable image generation/integration, visual/
cultural template work, and **music/audio sourcing** (the user is handling
that themselves now — do not source, download, or wire up any audio files)
are all being handled separately and are **out of scope here** — do not
touch files under `src/themes/*.ts`, `public/themes/<id>/`, `src/lib/music.ts`,
`src/routes/templates.tsx`, `src/routes/index.tsx`, or anything Lovable/theme
-catalog/audio related. If you think something in that area needs changing to
finish your task, stop and say so instead of doing it.

---

## Task 1 — Verify & apply the Supabase migration, confirm auth/data flow end-to-end

### Current state (verified)
- `supabase/migrations/0001_init.sql` defines 5 tables (`profiles`, `invites`, `invite_assets`, `orders`, `invite_views`) plus RLS policies and a `storage.buckets` entry (`invite-media`). Per `NEXT-STEPS.md:52-53`: *"The database. `supabase/migrations/0001_init.sql` still needs running in the Supabase SQL editor before accounts, saving or publishing work."* — i.e. as of that note, it had **never been applied** to the live Supabase project. This may since be stale (it's an old note) — your first job is to find out the actual current state, not assume either way.
- The app already has real, wired Supabase code that depends on this schema existing: [src/lib/supabase.ts](src/lib/supabase.ts) (client), [src/lib/invites-api.ts](src/lib/invites-api.ts) (full CRUD: `listInvites`, `getInviteById`, `getPublishedBySlug`, `getByPreviewToken`, `createInvite`, `saveInvite`, `deleteInvite`), [src/lib/auth.tsx](src/lib/auth.tsx) (`supabase.auth.getSession()`, `onAuthStateChange()`, `signOut()`), and `src/routes/login.tsx` (`signUp()`, `signInWithPassword()`). If the migration was never run, **none of signup, login, saving, or publishing can actually work today** — the UI would render but every Supabase call would fail against tables that don't exist.
- `.env.example` has `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` — confirm whether the real `.env` (not committed) has these pointed at an actual live Supabase project, or is still a placeholder.

### What to actually build/verify
1. **Determine whether the migration has been applied.** Check the real `.env` for a live `VITE_SUPABASE_URL`. If there's a live project and you have (or the user can give you) access — via the Supabase CLI (`supabase db push` / `supabase migration list`) or the Supabase dashboard's SQL editor/table editor — confirm whether `profiles`/`invites`/`orders`/etc. actually exist there yet.
2. **If not applied**: apply `0001_init.sql` to the live project. Prefer the Supabase CLI if it's set up in this repo (check for a `supabase/config.toml` or similar); otherwise give the user the exact SQL-editor steps and wait for them to confirm it ran, rather than guessing you have access you don't.
3. **If already applied** (or once it is): do a live end-to-end smoke test in the browser (`npm run dev`) — sign up a new test account, confirm a `profiles` row is created (via the `handle_new_user()` trigger), create a draft invite, save it, confirm it persists on reload, and check the RLS policies actually scope data to the signed-in user (a second test account should not see the first account's invites).
4. **Report back clearly** what you found: was the migration already applied or not, did the smoke test pass, and are there any RLS/permission errors in the browser console during the flow. This closes out a genuinely unknown piece of project state, not just a theoretical TODO.
5. Do **not** modify `0001_init.sql` itself unless you find an actual bug in it during the smoke test (e.g. a broken trigger or RLS policy) — if you do find one, write a new migration file (`0002_*.sql`) rather than editing the already-applied one, since Supabase migrations are meant to be append-only once run against a real project.

**Do not** invent Supabase credentials or assume you have dashboard access — if you can't reach the live project yourself, say exactly what you need from the user (project ref, whether they can run the SQL editor step themselves) rather than stalling silently.

---

## Task 2 — Wire up a payment gateway (YouPI PG, self-hosted UPI)

### ⚠️ Read this before building anything
The chosen gateway is **YouPI PG** (`https://github.com/youpi-pg/YouPI-PG`), a
self-hosted UPI/COD gateway — **not** Razorpay/Stripe despite what the DB
schema's default suggests (see below). Its own README states, verbatim:

> "YOUPI PG V2 is an independent, experimental research and learning
> project. It is not represented as a certified, bank-approved,
> NPCI-approved, audited, or production-ready payment gateway... Not for
> critical payments: do not rely on it for essential, high-value,
> high-volume, time-sensitive, or business-critical transactions."

It suggests a conservative cap of **~20 transactions/day per receiving
account** for experiments, and detects payment by parsing bank SMS/Gmail
alerts and WhatsApp OTP (not a certified settlement callback) — their own
"known design risks" section flags delayed/duplicate/spoofed alerts and
notes that "amount matching is not a complete payment identity check."

**This means real business risk**: possible account holds from the bank,
missed/duplicated payment detection, and no NPCI/RBI compliance guarantee.
If you're the agent picking this up: implement it faithfully per the spec
below, but if anything in the setup looks like it increases that risk
(e.g. being asked to raise the 20/day limit, skip webhook signature
verification, or skip the manual-review path for `/order-suspicious`),
stop and flag it to the user rather than just proceeding. This is the
user's informed choice to make, not yours.

### Current state (verified — there is ZERO payment code today)
- `supabase/migrations/0001_init.sql` already has an `orders` table: `id`, `user_id`, `invite_id`, `tier` (default `'classic'`), `amount_minor` (integer — "never store money as a float", comment in the migration), `currency` (default `'INR'`), `gateway` (default `'razorpay'` — **stale default, this column's default value should be updated to `'youpi'` or similar as part of this task**), `gateway_order_id` (unique), `gateway_payment_id`, `status` (check constraint: `created`/`paid`/`failed`/`refunded`), `created_at`, `paid_at`. This schema is a reasonable fit for YouPI too (`gateway_payment_id` ↔ YouPI's `paymentId`, add a column or reuse `gateway_order_id` for YouPI's `utr` if you need to store it — decide when you get there) — no code anywhere reads or writes this table yet.
- No payment SDK/script is wired into the app yet.
- No webhook route exists anywhere in `src/routes/`.
- `src/routes/terms.tsx` and `src/routes/privacy.tsx` have generic legal boilerplate mentioning "a third-party payment gateway" — update this copy once YouPI is live, since it's self-hosted by the merchant, not a third party in the usual sense.
- `.env.example` currently has only 2 vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) — no payment keys yet.
- Existing Supabase wiring to copy patterns from: [src/lib/supabase.ts](src/lib/supabase.ts) (client setup), [src/lib/invites-api.ts](src/lib/invites-api.ts) (CRUD wrapper pattern — `listInvites`, `getInviteById`, `createInvite`, `saveInvite`, etc., all `supabase.from("invites")...`). Follow this same wrapper-function pattern for a new `src/lib/orders-api.ts`.
- Pricing shown today (marketing copy only, not enforced): `src/routes/index.tsx` pricing section — ₹599 one-time, see `pricing.*` keys in [src/i18n/translations.ts](src/i18n/translations.ts).

### YouPI PG — what it actually is and what standing it up requires
Unlike Razorpay/Stripe, YouPI PG is **not a hosted API you just call** — it's
a full self-hosted service stack the merchant (you) runs. Per its README:
- **Prerequisites**: Node.js ≥ 22.13.0 LTS (needs native `node:sqlite`). No Docker required; Postgres/Redis are optional, it provisions its own SQLite DB on first run.
- **Services it runs, each on its own port** (all local by default, need real hosting + domain for production):
  - Control Center Supervisor — `:8090`
  - Merchant Admin Panel — `:6001`
  - Showcase Demo Store — `:5000` (reference only, not needed for your integration)
  - Payment REST API — `:6100`
  - Customer Checkout Portal — `:7000`
- **Payment detection mechanism**: it watches a connected bank account for incoming UPI payments via (a) an Android "observer" app reading SMS/notifications, and/or (b) a Gmail observer polling bank alert emails, and/or (c) Google Messages for Web over Chrome DevTools Protocol. One of these must be set up and running for payments to ever be detected as paid — this is not optional infrastructure, it's core to how the gateway confirms payment.
- **WhatsApp OTP**: pre-checkout customer verification goes over an embedded WhatsApp socket (Baileys/"Berry Protocol") — needs a WhatsApp number connected to the YouPI instance.
- **Setup**: `git clone` the YouPI repo **as a separate deployment** (it is not an npm dependency of this project — it's its own standalone app you self-host, e.g. on a VPS), `cp .env.example .env`, `npm install`, `npm run dev`/`npm start`. It self-provisions its SQLite DB and runs its own test suite (`npm test`, 31 suites).

### Client-side integration (confirmed from the README, use exactly this)
**Checkout script**, loaded once in the page `<head>` (or equivalent — this project uses TanStack Start's `head()` route config, see how other themes load Google Fonts via `links` in `src/routes/templates.tsx` for the pattern):
```html
<script src="https://pay.yourdomain.com/youpi.js"
        data-youpi-key="YOUR_MERCHANT_PUBLIC_KEY"
        data-currency="INR">
</script>
```
`pay.yourdomain.com` is wherever YouPI's Checkout Portal (`:7000`) ends up deployed/tunneled to — decide this with the user (they may use a Cloudflare Tunnel per the README's white-label section, e.g. `pay.easyinvitemaker.com`).

**Declarative button** (simplest path, no JS needed):
```html
<button data-youpi-pay
        data-order-id="ORDER-1001"
        data-amount="499.00"
        data-currency="INR">
   Buy Now with YOUPI PG
</button>
```

**Programmatic API** (use this one — fits a React/TanStack app better than a raw DOM button):
```js
window.Youpi.pay({
  order_id: 'ORDER-1001',   // use the orders.id (or a generated order code) from your own orders table
  amount: 499.00,            // keep in sync with amount_minor / 100 in the orders table
  currency: 'INR',
  name: 'EasyInviteMaker',
  description: 'Royal tier invitation — <invite slug>',
  handler: function(response) {
    // response: { status: 'SUCCESS', order_id, amount_received, utr }
    // Do NOT mark the order paid here — this is a UX convenience only.
    // Wait for the server-side webhook (below) before trusting payment.
    window.location.href = `/order-success?order_id=${response.order_id}&utr=${response.utr}`;
  },
  onClose: function() {
    // customer closed the modal without paying
  }
});
```

### Server-side webhook (mandatory — do not skip, this is the only trustworthy signal)
The README is explicit: **"Never fulfill orders based solely on frontend
browser events. Always verify the backend HMAC-SHA256 signature."** Add a
TanStack Start server route (check `@tanstack/react-start` 1.168.60's current
server-route file convention, e.g. `src/routes/api/webhooks/youpi.ts`) that:
1. Reads the **raw, unparsed request body** (the signature is computed over raw bytes, not the parsed JSON — parse only after verifying).
2. Verifies header `X-Gateway-Signature: sha256=<hex>` via HMAC-SHA256 over the raw body using a `YOUPI_WEBHOOK_SECRET` env var, with a constant-time compare (`crypto.timingSafeEqual` in Node). Reference implementation from the README:
   ```js
   import crypto from 'node:crypto';
   // req.body must be the raw Buffer, not pre-parsed JSON
   const signature = req.headers['x-gateway-signature'] || '';
   const secret = process.env.YOUPI_WEBHOOK_SECRET;
   const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.body).digest('hex');
   if (signature.length !== expected.length ||
       !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
     return res.status(401).json({ error: 'Invalid webhook signature' });
   }
   const payload = JSON.parse(req.body.toString('utf8'));
   if (payload.event === 'SUCCESS') { /* fulfill */ }
   ```
3. Payload fields to expect: `event` ('SUCCESS'), `orderId`, `amount` (string, rupees), `amountPaise` (integer), `utr` (12-digit bank reference), `paymentId` (gateway session UUID). Also check `X-Gateway-Delivery-Id` for idempotency (store processed delivery IDs so a retried webhook doesn't double-fulfill) and `X-Gateway-Timestamp` for freshness/replay protection — the README calls out replay risk explicitly.
4. On a verified `SUCCESS` event: call `markOrderPaid(orderId, { paymentId, utr, amountPaise })` in your new `src/lib/orders-api.ts`, update `orders.status = 'paid'`, `orders.paid_at = now()`, then allow `invites.status` to transition to `'published'` for the linked invite.
5. Also handle (per the README's 5 outcome pages, mirror this status logic): `/order-failed` (verification timed out — leave order as `created`/mark `failed`), `/order-suspicious` (fraud-flagged — **do not auto-fulfill, hold for manual review**, consider a new `orders.status` value or a separate flag for this), `/order-expired` (5-minute session elapsed), `/order-cancelled`.

### What to actually build, in order
1. **Confirm with the user** before deep integration work: where YouPI itself will be hosted (a VPS, separate from this Vite app — it's a whole Node service stack, not a library), which bank account/UPI VPA it watches, which observer channel (Android app vs Gmail vs Google Messages) they'll run for payment detection, and exact price per tier (`classic`/`royal` — `Tier` type already exists in `src/themes/types.ts`).
2. Stand up a YouPI PG instance (separate clone/deploy, per their Quickstart) in a **test/sandbox context first** — their README itself frames this as experimental, so do initial integration testing with the conservative ≤20/day limit, small real amounts or the account holder's own test payments, never a stranger's money, until the user has verified it end-to-end.
3. Add the checkout script + `window.Youpi.pay()` call into the invite publish/checkout flow (likely `src/routes/publish.tsx` — read it first, `audit/report.md:8` notes the publish flow already "leads to a real payment gateway" hook point).
4. Add `YOUPI_MERCHANT_PUBLIC_KEY`, `YOUPI_WEBHOOK_SECRET`, and the YouPI checkout-portal base URL to `.env.example` + real `.env` — never commit the webhook secret.
5. Create `src/lib/orders-api.ts` mirroring `invites-api.ts`: `createOrder(inviteId, tier, amountMinor)`, `markOrderPaid(orderId, gatewayFields)`, `markOrderFailed(orderId)`, `getOrderById(orderId)`.
6. Build the webhook route per the "Server-side webhook" section above.
7. Gate invite publishing: `invites.status` → `'published'` only after `orders.status = 'paid'` for that invite.
8. Update `orders.gateway` column default from `'razorpay'` to the actual value you use (e.g. `'youpi'`) — small migration or just change the default going forward, confirm with user which.
9. Test full loop live: test order → YouPI test payment → webhook fires → signature verifies → `orders.status = 'paid'` → invite becomes publishable. Also deliberately test a failed/expired/duplicate-webhook case, not just the happy path, given the README's own warnings about duplicate/delayed alerts.
10. Keep `npx tsc --noEmit` and `npm test -- --run` clean throughout.

**Do not** skip webhook signature verification "to save time" and do not treat the client-side `handler` callback as proof of payment — the README is unusually explicit that this specific gateway's detection mechanism (bank alert parsing) is not a certified payment-identity check, so the server-side verification + idempotency handling matters more here than it would with a conventional gateway.

---

## Lower-priority / optional (not required unless user asks)
- `invite_assets` and `invite_views` tables exist in the migration but have **zero application code** touching them (no asset-upload flow, no view-logging). Only build these if the user explicitly asks for guest-photo uploads or view-analytics — don't do it speculatively as part of Tasks 1/2.
- Background music: **do not pick this up.** The user is sourcing/handling music tracks themselves. If you notice themes are still silent, that's expected and not your job right now.

---

## Ground rules for whoever picks this up
- Read `AGENTS.md` at repo root first — hard constraints on git history with Lovable.
- Keep `npx tsc --noEmit` and `npm test -- --run` passing after every meaningful change (this has been the standing bar all session).
- Don't touch the Dubai Silk theme's existing assets/music/mechanics unless explicitly asked.
- Verify changes live in the browser (dev server via `npm run dev`), don't just trust that files exist or types compile — this project has repeatedly needed visual/audio confirmation, not just static checks.
- For anything price/payment/legal-entity related: stop and ask the user rather than guessing.
- Do not touch music/audio — that's the user's own task now, not yours.
