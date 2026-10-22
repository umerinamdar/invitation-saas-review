# DEPLOYMENT.md — shortest safe path to production (owner executes)

The app has **no deploy script and no committed deployment config**.
The build produces a Cloudflare Worker via Nitro; this document is
the whole procedure. Every step is owner-executed (credentials,
approvals, live systems). Sources: release audit Agent D
(`mission/evidence/release-audit-d.log`), `RELEASE-CHECKLIST.md`,
`OPS-RUNBOOK.md`.

> Two migrations have OPPOSITE safe orders. **0004 goes BEFORE the
> code; 0003 goes AFTER the code.** 0005 goes only with/after the
> Round-3.7 code. 0006 is independent but must be live before
> payments are enabled. Follow the steps in order — do not improvise
> the sequence.

---

## 0. Preconditions

Do not start until all of these are true:

1. **Live-state + RLS established (launch blocker DB-2).**
   `RELEASE-CHECKLIST.md` §1: confirm whether migrations 0001/0002
   are applied to the live project, and run `RLS-VERIFICATION.sql`
   (catalog blocks + the two-account Block D checks) with results
   recorded.
2. **Decisions known:** D1 (approve migration 0005 + its pre-flight
   cleanup) and D2 (abandoned-checkout staleness — implemented
   default: reuse the active order indefinitely), and the G1
   disposition: **G1 is UNRESOLVED** — do not enable live payments on
   reused orders until `G1-SANDBOX-PROTOCOL.md` has been run or the
   provider has answered Q1–Q7 in writing.
3. **Accounts/infrastructure:** Cloudflare account + a domain (or
   subdomain) for the site; the YouPI portal publicly reachable over
   HTTPS on its own host/subdomain; YouPI merchant panel access;
   Node + npm on the build machine.
4. **All env values in hand** (table below): the 5 client values for
   build time, the 4 server secrets for the Worker. No secret values
   in this document, in chat, or in the repo — names only.
5. The four root probe scripts are quarantined/deleted on the build
   machine (checklist §5) so they can never ship.

## Environment (9 names)

Client values are inlined into the browser bundle **at build time** —
set them in the release `.env` BEFORE `npm run build`. Server secrets
are set on the Worker in step 4 and never touch the repo.

| Name | Where | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | build time **and** Worker runtime | The browser client uses it; the server reads it too (`process.env`) — set it in BOTH places. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | build time | Public by design (RLS protects the data). |
| `VITE_YOUPI_CHECKOUT_URL` | build time | `__root.tsx` loads `{URL}/youpi.js`; without it the payment UI is dead. |
| `VITE_YOUPI_MERCHANT_PUBLIC_KEY` | build time | Sent as the checkout script's `data-youpi-key`; empty = checkout cannot initialise. |
| `VITE_SITE_URL` | build time | The real https origin. Without it, canonical/og absolute URLs are cleanly omitted (app still runs). |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker secret | Bypasses RLS; webhook settlement + signed URLs run on it. Absence = import-time throw, `/api/health` flags it. |
| `YOUPI_WEBHOOK_SECRET` | Worker secret | Webhook HMAC verification + gateway corroboration. Absence fails fulfilment closed. |
| `YOUPI_API_BASE_URL` | Worker secret | Server-side payment lookup (`GET /api/v1/payments/{id}`) that corroborates every webhook. |
| `VITE_SUPABASE_URL` (again) | Worker var | See row 1 — the server reads the same name via `process.env`. |

Startup validation logs ONE loud line naming any missing server
variables (it deliberately does not throw); `GET /api/health`
exposes the same four as booleans only — that is the post-deploy
config check in step 5.

---

## Procedure

1. **Build with gates green.**
   `npm install && npm test && npx tsc --noEmit && npm run build`
   — use **npm** (a stale `bun.lock` sits in the root; ignore it).
   The build embeds the client env: do not reuse a stale `.output`,
   and verify the built output carries the real `VITE_YOUPI_*` /
   `VITE_SITE_URL` values (a build from a `.env` missing them ships
   a site with dead checkout and no absolute URLs).

2. **Migration 0004 — BEFORE the code.** Apply
   `supabase/migrations/0004_settle_and_publish.sql` in the Supabase
   SQL Editor (its header carries the mandatory EXECUTE revoke — do
   not skip or alter it). Then run `VERIFY-0004.sql` V1–V3 (existence
   + signature, definition sanity, ACL: anon = false, authenticated
   = false, service_role = true) and the V4 smoke call — expected
   `not_found`. Any deviation = STOP.
   Do NOT apply 0003 yet. Do NOT apply 0005 yet unless D1 is decided
   (pre-flight conflict report + cleanup first; and never before
   this code deploy — checklist §1, sequencing warning G4).

3. **Migration 0006 — any time before payments.** Apply
   `supabase/migrations/0006_invite_status_guard.sql`, then run the
   RLS pack's Block D checks D9/D10 (self-publish must fail / land as
   draft). It is independent of the code deploy, but it **must be
   live before payments are enabled**.

4. **Deploy the Worker from `.output`.**
   `npx wrangler --cwd ./.output deploy`
   Two caveats from the audit: wrangler is NOT a project dependency
   (npx fetches it, unpinned — version drift is possible), and the
   generated `.output/server/wrangler.json` names the Worker
   **`tanstack-start-ts`** (the template default). Rename the worker
   / add the custom domain in that file first, or bind the domain in
   the Cloudflare dashboard immediately after — otherwise the deploy
   lands on `tanstack-start-ts.<account>.workers.dev`.

5. **Set the 4 server secrets on the Worker:**
   `SUPABASE_SERVICE_ROLE_KEY`, `YOUPI_WEBHOOK_SECRET`,
   `YOUPI_API_BASE_URL`, and `VITE_SUPABASE_URL` (needed at runtime
   as well as build time). Restart/redeploy so they take effect.
   Also confirm the Supabase Auth allow-list includes
   `<domain>/reset-password` (checklist §1) so password-recovery
   links work.

6. **Verify config.** `GET https://<domain>/api/health` → all four
   config booleans `true`; the startup log shows no "Missing required
   server environment variables" line.

7. **Register the webhook** in the YouPI panel:
   `https://<domain>/api/webhooks/youpi` (exact path, real domain —
   not a tunnel or localhost URL).

8. **Guest check #1.** Open a real published invite logged-out:
   photos and music load (the bucket is still public at this point —
   this proves the deploy itself).

9. **Migration 0003 — AFTER the code.** Apply
   `supabase/migrations/0003_invite_media_hardening.sql` (backup
   first; record the bucket's current state, per checklist §1).
   Re-run `RLS-VERIFICATION.sql`. **Guest check #2:** the same invite
   still loads fully — now via server-minted signed URLs — and a
   draft's media is not guest-reachable. Scan Worker logs for the
   signed-URL diagnostic line ("Signed URL minting incomplete…").

10. **Migration 0005** (only if D1 approved, and only now — with or
    after this code deploy): pre-flight report → cleanup → apply →
    post-apply index check from checklist §1.

11. **First real payment.** One genuine ₹599 purchase end-to-end
    (owner's own): invitation publishes, the success page reflects
    the real paid state, webhook delivery + gateway lookup succeed,
    and the WhatsApp share on the success page carries the real
    `/i/<slug>` link. Spot-check reconciliation Q1/Q4/Q6a/Q6b/Q7.

---

## Rollback (per layer)

- **Code:** redeploy the previous `.output` (Workers keeps prior
  versions: dashboard → Deployments → rollback, or re-run step 4
  with the previous build).
- **0004:** code rollback alone suffices — the old code never calls
  the function. The function may stay (unused, execute revoked) or
  be dropped per 0004's rollback block.
- **0003:** its commented rollback block restores the public bucket +
  original policy.
- **0005:** drop-index rollback in its header.
- **0006:** commented rollback block in its header (dropping the
  guard re-opens the self-publish hole — only together with a
  replacement guard).
- **Secrets/domain:** dashboard-side, reversible independently.

## Known risks (from the audit)

- Nitro is a beta (3.0.260603-beta) and wrangler is unpinned via
  npx — the toolchain can drift; test the exact built `.output`
  before launch.
- Deploying the code before 0004 breaks fulfilment (fails closed:
  webhook 500s, nothing recorded — recoverable once 0004 lands, but
  an outage). Applying 0003 before the code breaks guest media.
- No error-reporting service: production visibility is Workers logs
  + `/api/health` (+ any uptime monitor pointed at it). Acceptable
  for launch scope; noted as a gap.
- `README.md` / `NEXT-STEPS.md` / `BUILD-PLAN.md` contain stale
  deploy claims (Razorpay, Vercel) — this document and
  `RELEASE-CHECKLIST.md` supersede them.
