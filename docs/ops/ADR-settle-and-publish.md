# ADR — Atomic settlement + publication via `settle_and_publish` (Round 3.7)

Status: **ACCEPTED and implemented in code + migration file (2026-10-22).**
Migration 0004 is **NOT APPLIED** anywhere; applying it is an owner action
(RELEASE-CHECKLIST §1). Production readiness remains **NO-GO** until 0004 is
live in the documented order and the Q-17 drill passes on real PostgreSQL.

## Context

Webhook fulfilment was a sequence of separate PostgREST statements, each
its own transaction: `markOrderPaid` (conditional UPDATE on `orders`), then
`publishInvite` (conditional UPDATE on `invites`). Rounds 3–3.6 made every
step conditional and classified every zero-row outcome by re-reading — but
one window is structural and no re-read can close it:

1. A SUCCESS delivery wins its mark-paid transition.
2. A refund commits (the order becomes `refunded`).
3. The delivery's separate publish statement runs, inspecting only the
   invite, and publishes a refunded customer's invitation.

Refund census (Agent-2 investigation, verified by grep): **`refunded` is
never written by application code.** There is no refund webhook action (a
REFUNDED event is planned `ignore/unknown_event`), no admin route, no SQL
in the repo. Refunds happen out of band: the owner refunds at the YouPI
gateway portal, then flips the row manually (SQL editor / dashboard),
per the runbook rule "refunds are executed at the gateway; the database
status follows the gateway". Any design requiring the refund path to
"also call X" is therefore undeployable as a guarantee — the publish side
must be robust against an **arbitrary concurrent single-row UPDATE of
`orders.status`**.

Why code-only cannot work (Option B, rejected): the needed statement —
publish the invite only if its order is currently `paid`, atomically —
cannot be expressed through PostgREST (supabase-js `.update()` predicates
bind only to the target table's columns; there are no subquery filters
and no raw-SQL escape hatch), and Postgres row locks live only within a
single transaction while every PostgREST request is its own transaction.
A re-read narrows the window; it cannot close it.

## Decision

One plpgsql function, `public.settle_and_publish(p_order_id uuid,
p_gateway_payment_id text) returns text` (migration
`supabase/migrations/0004_settle_and_publish.sql`), performs settlement
and publication in a single transaction:

1. `SELECT ... FOR UPDATE` the **orders** row → `not_found` if absent.
2. `refunded` → return `refunded`, no writes. `created`/`failed` → if
   `p_gateway_payment_id` is null return `not_paid` (recovery mode never
   marks); else mark paid writing exactly `markOrderPaid`'s fields
   (`status`, `paid_at`, `gateway_payment_id`). `paid` → proceed.
3. `invite_id` null → `settled_no_invite`.
4. `SELECT ... FOR UPDATE` the **invites** row → `published`:
   `settled_already_published`; `archived`: `conflict_archived`;
   `draft`: publish (writing `publishInvite`'s fields) →
   `settled_published`; row missing/other: `retryable`.

The webhook handler calls it from all three fulfil paths
(`mark_paid_and_publish` with the corroborated payment id,
`publish_only` with null, and the archived-conflict branch with the
payment id) and maps outcomes onto the response vocabulary established
in Rounds 3–3.6 (see the mapping table in
`mission/evidence/round37-fixes.log`). `fulfilmentPlan`,
`markOrderFailed`, and all other branches are unchanged. `publishInvite`
and `markOrderPaid` remain as library helpers in `orders-server.ts`
(`publishInvite` with its Round-3.7 fallback-read fix); the handler no
longer composes them.

**A note on RETURN outcomes and commits** (precision added in the
Round-3.7 adversarial review): "one transaction" must not be read as
"non-settled outcomes write nothing". A plpgsql `RETURN` commits
everything the call has already written. Two outcome families
therefore COMMIT a mark-paid performed earlier in the same call:
`conflict_archived` (intentional — the money genuinely moved, the
order must stay truthfully paid, and Q5 reconciles it) and the
defensive `retryable` cells (invite row missing / unrecognized
invite status — unreachable while the orders→invites FK and the
0001 status CHECKs hold). For the `retryable` cells the handler then
throws and records nothing, so the residue is *paid order +
unrecorded delivery* — exactly the scenario-14 shape, which
self-heals on redelivery (the order now reads paid, and the
redelivery completes or classifies the publication). `refunded`,
`not_found` and `not_paid` perform no writes at all.

**Lock order: orders row first, invites row second — everywhere,
forever.** Deadlock reasoning (corrected in the Round-3.7 adversarial
review — the original text claimed no lock cycle could form; that
was wrong): among *application* writers, this function is the only
multi-row transaction; every other application writer is single-row
(markOrderFailed → orders; legacy publish → invites; manual refund →
orders) and can block on the function but cannot cycle with it. But
the shipped schema's FK referential actions are multi-row effects
that exist TODAY: deleting an invite takes the invite row lock and
then updates its orders (`ON DELETE SET NULL`), and deleting a
profile cascades invites → orders. Such a delete, running
concurrently with the function (which holds the order lock and
wants the invite lock), CAN form a genuine lock cycle. Postgres
detects it and aborts ONE side with 40P01: if the function is the
victim, the webhook caller treats the RPC error as a retryable 500
with nothing recorded and redelivery retries; if the delete is the
victim, the owner's delete fails loudly. Either way no invariant
breaks and no false outcome is produced — but a cycle is possible.
The same treatment covers the previously documented exception: a
future multi-statement script that updates invites BEFORE orders
would invert the lock order and meet the same 40P01 abort — a
deadlock victim is a delay, never a false outcome.

**Security:** Postgres grants EXECUTE on new functions to PUBLIC and
PostgREST exposes public-schema functions as endpoints, so the migration
mandatorily revokes EXECUTE from `public, anon, authenticated` and
grants it to `service_role` only. Without that, any signed-in user
could settle their own order without paying. The function is
`SECURITY INVOKER`; its sole caller is the service role, which bypasses
RLS (orders has no UPDATE policy for anyone else anyway — defence in
depth, not a substitute for the revoke).

## The precise guarantee

Under READ COMMITTED, once 0004 is live and all publish paths use the
function, for any refund implemented as an update of the orders row:

- (a) the refund commits **before** the function takes the order lock →
  the function observes `refunded`; the invite is NOT published by that
  call;
- (b) the refund attempts **while** the function holds the lock → it
  blocks until the function commits; the publish decision was made
  against a state in which the order was genuinely paid.

The mark-paid → publish window ceases to exist, because check and
publish are one transaction holding the order lock throughout.

**NOT covered** (by any publish-side design):

- A refund that lands **after** a legitimate publication. Preventing it
  would require the refund to unpublish — a product-policy decision,
  explicitly the owner's. **Recommendation: no auto-unpublish in this
  round.** Refunds are manual today; RECONCILIATION Q6a detects the
  state and runbook §2.2 is the response procedure.
- A refund mechanism that never writes `orders.status` (per the census,
  none exists — the status IS the record).
- Gateway-side money movement itself (external; the DB status follows
  the gateway, never the reverse).

## Deployment

Migration BEFORE code (the reverse of 0003's order):

0. Owner confirms migrations 0001/0002 are actually applied live.
1. Apply 0004.
2. Smoke check: call with a random uuid → expect `not_found`.
3. Deploy the Round-3.7 code.
4. Watch the first deliveries; run RECONCILIATION.sql.

Mis-sequencing fails **CLOSED**: code-first → PostgREST PGRST202 →
handler 500 → nothing recorded, nothing falsely fulfilled; redeliveries
recover once the function exists. Rollback = redeploy the previous code
(it never calls the function); the function may stay (unused, execute
revoked) or be dropped per 0004's rollback block.

## Verification status

- Mocked handler tests model the function's **outcome contract**
  (state at call time → outcome string → handler response/recording)
  and the interleaves around the call. They cannot prove Postgres
  row-lock, snapshot or deadlock behaviour.
- Real-PostgreSQL verification = the Q-17 staging drill (runbook §6),
  including the lock-blocking step. Until it passes, the invariant is
  **FIXED in code, NOT VERIFIED on real PostgreSQL**.

## Alternatives considered

- **Option B (code-only predicate/re-read):** impossible on this stack
  (see Context). Rejected — a re-read dressed as a fix would be a
  false claim.
- **Option C (BEFORE UPDATE trigger on invites vetoing publication
  without a paid order):** capable of similar serialization, rejected
  as primary — it fires for every publisher including owner UI
  publishes under RLS (vetoing legitimate manual publishes), surfaces
  opaque errors instead of typed outcomes, and is harder to test.
  Viable later as defence in depth with an owner-publish escape hatch.
