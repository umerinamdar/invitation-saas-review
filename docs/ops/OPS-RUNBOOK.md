# OPS-RUNBOOK.md — EasyInviteMaker operations

Owner/operator runbook for the live site: payment reconciliation, stuck-order
recovery, backups/DR status, monitoring, and incident first response.

**Claim labels used throughout** (per the mission's honesty rules):
- **Verified** — checked against the code or by a recorded test/probe.
- **Platform-default** — how Supabase/Cloudflare normally behave; not yet
  confirmed on this project's actual accounts/plans.
- **UNVERIFIED** — nobody has checked this against the live system. Do not
  treat it as working until the owner confirms it.

Companion documents: `RELEASE-CHECKLIST.md` (one-time launch setup),
`SECURITY-REVIEW.md` (open findings) — both ship alongside this runbook
under `docs/` — and `currency-investigation.md` (YouPI gateway lookup
details; workspace-only note, not shipped in the delivery package).

---

## 1. Payment reconciliation

Run these in the **Supabase SQL Editor** (service-role context; they read
privileged tables). Suggested cadence: daily until the first real payments
have settled cleanly, then weekly. All three are read-only `SELECT`s.

### 1.1 Paid but unpublished — the money-without-product case

An order reached `paid`, but its invitation never became `published`.
Under the current code the webhook settles and publishes in one
transaction (**Verified** — `settle_and_publish` RPC via
`src/routes/api/webhooks/youpi.ts`; requires migration 0004 applied),
so any row here means fulfilment failed outright, the residue predates
that code, or the invite was unpublished/archived by hand afterwards.
Follow §2. Rows whose `invite_status` is `archived` are different:
since Round 3 the webhook deliberately never publishes an archived
invite (see §2 step 3 and `RECONCILIATION.sql` Q5) — those need a
human decision, not a redelivery.

This is the same query as `RECONCILIATION.sql` **Q1** (aligned in
Round 3.7 — earlier versions of this section used an inner join that
missed paid orders whose invite had been deleted). The `LEFT JOIN`
also surfaces orders whose `invite_id` is NULL (invite deleted after
payment): `invite_status` is NULL for those rows.

```sql
select o.id as order_id, o.invite_id, o.paid_at, o.gateway_payment_id,
       i.status as invite_status
from orders o
left join invites i on i.id = o.invite_id
where o.status = 'paid'
  and (o.invite_id is null or i.status is distinct from 'published')
order by o.paid_at;
```

### 1.2 Stale pending orders — checkouts that never settled

Orders still `created` after 24 hours are abandoned or interrupted
checkouts. Normally harmless (the draft stays unpublished); a sudden jump
suggests checkout or gateway trouble worth a look before customers complain.

```sql
select id as order_id, user_id, invite_id, amount_minor, currency, created_at
from orders
where status = 'created'
  and created_at < now() - interval '24 hours'
order by created_at;
```

### 1.3 Deliveries without fulfilment — webhooks that arrived but didn't settle

The webhook handler records a delivery row **only after** fulfilment
succeeds (**Verified** — handler + `recordWebhookDelivery` in
`src/lib/orders-server.ts`), so a recorded delivery whose order is still
`created` means the delivery was logged on a no-op path (e.g. an event type
the handler ignores) or something is genuinely inconsistent. Read the
payload's event type before treating it as an incident.

```sql
select d.delivery_id, d.created_at as delivered_at,
       d.payload ->> 'orderId' as order_id,
       d.payload ->> 'event' as event,
       o.status as order_status
from webhook_deliveries d
left join orders o on o.id::text = d.payload ->> 'orderId'
where o.id is null or o.status = 'created'
order by d.created_at;
```

### 1.4 Terminal-state residues — run with the same cadence as §1.1–§1.3

Run **Q4, Q6a, Q6b, Q7 and Q8** from `docs/RECONCILIATION.sql` alongside
the checks above (added Round 3.7 — before that, no documented
cadence ever ran them, so the residues they detect were invisible in
practice; Q7 joined the cadence list with the emergency release —
before that it was wired into §2.1 and §6 only, so a bricked late
settlement between incidents could sit unseen; Q8 joined in impl
round 2 as the detector for the G1 residual).

- **Q4** (paid order with no recorded SUCCESS delivery) means paid
  state may have been set outside the verified webhook path — treat
  as an incident (§2.4).
- **Q6a** (refunded order, published invite, no surviving paid
  order) is handled in §2.2.
- **Q6b** (more than one paid order for one invite) is a duplicate
  charge until proven otherwise — handle it in §2.1.
- **Q7** (late-settlement conflicts — the migration-0005
  `duplicate_active_order` outcomes) means a late-settling payment
  collided with a newer active order for the same invite — handle it
  in §2.1.
- **Q8** (a recorded SUCCESS delivery whose paymentId differs from
  the order's stored gateway_payment_id) means the gateway collected
  TWICE for one order — the G1 residual. The database is consistent;
  refund the later payment at the gateway (§2.1).

---

## 2. Stuck-order recovery

For any order found by §1.1 (paid, unpublished):

1. **Corroborate with the gateway first.** Look the payment up in YouPI:
   `GET /api/v1/payments/{paymentId}` with the `X-Merchant-Key` header
   (details in `currency-investigation.md`). Compare the gateway's status,
   amount and currency against the stored order. **Verified** mechanism —
   this is the same lookup the webhook itself performs before fulfilling.
2. **If the gateway confirms paid (status + amount + currency all match)
   and the invite is still a draft:** use the YouPI merchant panel to
   **redeliver the webhook** for that payment. Redelivery is the designed
   retry path: the handler is idempotent — a delivery is recorded only
   after fulfilment, already-paid orders are a no-op success, and a
   redelivery re-runs fulfilment and publishes the invitation
   (**Verified** — handler logic + the webhook-fulfilment test suite).
   Since Round 3, republication is **draft-only**: the publish step is a
   conditional update that applies only while the invite is a draft.
   Re-run §1.1 afterwards; expect zero rows.
3. **If the invite has been archived since payment:** redelivery will NOT
   publish it — by design (Round 3 / WS2). The webhook answers the
   redelivery with a recorded conflict outcome (`200`,
   `{"status":"conflict","reason":"invite_archived"}`), leaves the order
   `paid` and the invite `archived`, and logs the conflict. Do not try to
   force publication. Run `RECONCILIATION.sql` **Q5** (paid but archived)
   to list every such order, then make a human decision per order —
   un-archive the invite deliberately in the product if the owner wants
   it live, or handle the customer through support (e.g. a gateway
   refund). The code never reactivates an archived invite on its own and
   never pretends a refund happened.
4. **If the gateway does not confirm paid:** do not publish. Treat it as a
   support case — the customer's claim does not override the gateway
   record. Keep the order and delivery rows untouched as evidence.

**NEVER do these:**

- Never flip `orders.status` or `invites.status` by hand in the SQL editor
  without a corroborating gateway lookup (step 1). A hand-flip publishes
  invitations nobody verifiably paid for and destroys the audit trail.
- Never edit or delete `webhook_deliveries` rows — they are the idempotency
  record; deleting one invites double fulfilment on redelivery.
- Never "fix" state by re-running a migration.
- Never mark an order `refunded` in the database first — refunds are
  executed at the gateway; the database status follows the gateway, never
  the other way round.

## 2.1 Duplicate-charge investigation and refund

For every invite returned by `RECONCILIATION.sql` **Q6b**:

1. List the paid orders for the invite (order id, gateway_payment_id,
   paid_at, amount). Keep the EARLIEST paid order as the legitimate one.
2. For each later paid order, corroborate at the gateway
   (`GET /api/v1/payments/{paymentId}`, `X-Merchant-Key`): the gateway must
   show a real, separate SUCCESS payment. If it does not, stop and treat
   the case under §2.4 — do not refund on database evidence alone.
3. Refund the duplicate payment(s) AT THE GATEWAY (YouPI merchant panel),
   one per duplicate order. Never mark an order refunded in the database
   first (§2 NEVER list): the owner's refund process updates
   orders.status to 'refunded' after the gateway refund.
4. After each refund lands, re-run Q6b (the invite should drop off).
   Q6a will NOT list the refunded duplicate while the legitimate paid
   order survives — its surviving-paid-order guard excludes funded
   publications by design, so no §2.2 action is needed for that order.
5. Record the case in the incident note: invite id, both payment ids,
   gateway refund references, timestamps. The customer was charged
   amount_minor × (number of duplicate orders) too much; confirm the
   gateway refund total matches before closing the case.

(Prevention status: the Q-16 Option-D fix — API reuse of the invite's
active order plus migration 0005's partial unique index — prevents
duplicate ORDERS once 0005 is applied and the Round-3.7 code is
deployed. Until then, and for historical rows, this procedure is the
control.)

**Late-settlement conflict (reason `duplicate_active_order`)** — the
0005 interaction, added in the Round-3.7 adversarial review:

- **Symptom:** a webhook log line "Webhook fulfilment conflict:
  settlement blocked by a duplicate active order" (fields: `orderId`,
  `reason: "duplicate_active_order"`), and/or rows in
  `RECONCILIATION.sql` **Q7** (an order still `failed`/`created` with
  a recorded SUCCESS delivery).
- **What happened:** the order's payment genuinely settled at the
  gateway LATE — after the order had been marked `failed` (a gateway
  timeout, or retired during the 0005 pre-flight cleanup) and a
  successor order had taken the invite's single active slot. With
  0005 live, the settle RPC's mark-paid `UPDATE` violates the
  partial unique index (23505) and aborts, so the handler records
  the delivery and answers a deliberate conflict instead of
  500-looping. The customer HAS paid; nothing was published for
  this order; the invite belongs to the successor order.
- **Resolution — the normal case (this payment is a duplicate):**
  corroborate at the gateway (§2 step 1) that the payment settled,
  then refund THIS payment at the gateway exactly as in steps 2–5
  above, keeping the successor order as the legitimate one. The
  order's database status follows the gateway refund through the
  owner's normal refund process.
- **Resolution — the late order is the ONLY real payment** (the
  successor checkout never actually collected): retire the
  successor order to `failed` (the 0005 cleanup operation — it
  frees the active slot), then ask the gateway to send a **FRESH**
  delivery for the late payment so it can settle and publish.
  Re-sending the SAME delivery id will not work: the conflict
  delivery was recorded, so it answers `already_processed`. If no
  fresh delivery can be obtained, the case is a manual owner
  resolution — do not hand-flip the order to `paid` (§2 NEVER list).
- **Do not** treat the conflict response as an error to retry: the
  gateway will not fix it by redelivering, and each fresh delivery
  id redelivered against the same state records another conflict
  (Q7 shows them all; that is expected, not a second incident).

## 2.2 Refunded-but-published incident response

For every row returned by `RECONCILIATION.sql` **Q6a** (the query
already excludes invites with a surviving paid order; step 1 is the
belt-and-braces re-check before anything is taken down):

1. FIRST check for a surviving paid order for the same invite
   (`select id, gateway_payment_id, paid_at from orders where
   invite_id = <invite> and status = 'paid'`). If one exists, the
   publication is still funded — this row is the expected residue of a
   refunded duplicate (§2.1). Do NOT unpublish; note and close.
2. If NO paid order survives, the refund is the final money state:
   corroborate at the gateway that the refund completed for the order's
   gateway_payment_id (§2 step 1 lookup).
3. Unpublish the invitation from the dashboard (archive it). Do not edit
   orders or invites by hand in SQL.
4. Re-run Q6a and the guest-link check: the public /i/<slug> link must no
   longer render. Record the incident (order id, payment id, refund
   reference, when the refund landed vs. when the invite was unpublished —
   the gap is the exposure window guests could see a refunded invite).

## 2.3 Failed webhook-delivery recording

Recording happens after fulfilment; if the record insert fails the handler
answers 500 and records nothing, so the gateway will redeliver. On
redelivery the handler re-runs idempotently and records the delivery then
(verified behaviour — Round 3.6 record-failure pin, unchanged by the
Round-3.7 RPC rewiring). Operator actions:

1. A webhook 500 with an order that is ALREADY in its final state (paid /
   failed / refunded) and no matching webhook_deliveries row (Q3/Q4) is
   the signature of a recording failure, not a fulfilment failure.
2. Ask the gateway to redeliver (§2 step 2). Do NOT insert a
   webhook_deliveries row by hand and never delete rows (§2 NEVER list) —
   delivery_id is UNIQUE (migration 0002), so a genuine duplicate
   re-record is rejected by the database and is not an error to fix.
3. If redelivery repeatedly 500s on the recording step, stop retrying and
   escalate under §2.4 with the deliveryId and orderId from the logs.

## 2.4 Gateway-status ambiguity — stop and escalate

Stop, change nothing, and escalate to the owner with the orderId,
gateway_payment_id and deliveryId (identifiers, not secrets) whenever:

- the gateway lookup errors, times out, or the instance is unreachable;
- the gateway shows SUCCESS but amount or currency differs from the order;
- the gateway shows a payment this project has no order for (or the
  reverse: a customer insists they paid and neither DB nor gateway shows
  it — take the customer's gateway receipt/UTR and look it up at the
  gateway before concluding anything);
- Q4 returns a row (paid state with no recorded verified delivery).

While a case is ambiguous: never flip order or invite state by hand,
never fulfil or refund on customer evidence alone, and preserve the
order, delivery and log lines untouched as evidence. The gateway record,
corroborated by amount + currency + status, is the only money truth.

---

## 3. Backups and disaster recovery

**Nothing in this section has been exercised. No backup has been taken,
restored, or even confirmed to exist by the agent team.**

| Item | State |
|---|---|
| Supabase automated DB backups | **UNVERIFIED.** **Platform-default:** availability and retention depend on the project plan (free-tier projects have no automated backups; paid plans add daily backups, and point-in-time recovery is a separate add-on). Owner: confirm in Supabase Dashboard → Database → Backups, and note the plan + retention here once seen. |
| Supabase restore procedure | **UNVERIFIED.** Never test-restored. Owner: confirm the restore path the plan offers (restore-in-place vs. clone to a new project) before an incident forces the question. |
| Storage (`invite-media` bucket) recovery | **UNVERIFIED.** Object-level recovery depends on the same plan/backup picture; a database restore does not by itself prove media objects are recoverable. |
| Cloudflare Workers rollback | **Platform-default, UNVERIFIED on this account:** previous Worker deployments can be rolled back from the Cloudflare dashboard. Owner: confirm the deployments list exists after the first real deploy. |
| Source-code recovery | **Verified (local):** a pristine copy of the original project plus hash-verified, cumulative changes-only ZIPs are kept in the delivery workspace, so the exact shipped codebase can be rebuilt and redeployed even if the working copy is lost. |
| RPO / RTO targets | **Not established — UNVERIFIED.** Set them only after the backup row above is confirmed; any number written before that would be invented. |

---

## 4. Monitoring checklist

App logs are deliberately sanitized: handlers log `errorClass`,
`deliveryId`, and `orderId` — never payloads, signatures, or secrets
(**Verified** — orders + webhook handlers). Those three fields are enough
to correlate any alert below with the SQL checks in §1. Logs are viewed in
the Cloudflare dashboard / Workers logs (**Platform-default** location).

Alert on:

- [ ] **Any 5xx from `POST /api/webhooks/youpi`.** A 500 there means
  fulfilment was deliberately deferred (fail-closed) — a real payment may
  be sitting unpublished. Run §1.1 the same day.
- [ ] **Any 5xx from `POST /api/orders`.** Checkout is broken for paying
  customers; check `errorClass` in the log line first.
- [ ] **Paid-but-unpublished count > 0** (§1.1 query) at the daily check.
- [ ] **`GET /api/health` non-200, or a `config` flag unexpectedly
  `false`** after a deploy — a missing env var/secret is the usual cause.
  The endpoint reports presence booleans only, never values (**Verified** —
  `src/routes/api/health.ts`, added in this ops task).
- [ ] **Any `Signed URL minting incomplete for published invite media`
  log line** (Round 3) — a published invite's stored media failed to
  sign; after migration 0003 that means broken guest media. Fields are
  `inviteId`, `failedCount`, `failedFiles` (names only). Causes and the
  full private-bucket deployment sequence: see
  `MEDIA-DEPLOY-SEQUENCE.md` in this folder.
- [ ] **Webhook 401 spikes.** Occasional invalid-signature rejections are
  internet noise; a spike after a deploy usually means the webhook secret
  in YouPI and `YOUPI_WEBHOOK_SECRET` no longer match
  (RELEASE-CHECKLIST §3).

Watch (no page, review weekly):

- [ ] Rate-limiter 429s on `/api/orders` or the webhook. The in-code
  limiter is a per-isolate backstop (**Verified**); sustained 429s mean
  either abuse or that the real control — the Cloudflare WAF rule in
  RELEASE-CHECKLIST §2 — is missing or mis-sized.

---

## 5. Incident first response

1. **Check `GET /api/health`.** If a `config` flag flipped to `false`
   after a deploy, fix the environment variable first — most "everything
   is broken" reports after a deploy are a missing secret, not bad code.
2. **Check the logs** for webhook/order 5xx and note the `deliveryId` /
   `orderId` on the failing lines (safe to write down and share; they are
   identifiers, not secrets).
3. **Run §1.1.** If anything is paid-but-unpublished, follow §2 exactly —
   gateway lookup, then panel redelivery.
4. **If payments are broadly failing,** check the YouPI instance itself
   (panel reachable? webhook URL + secret still matching the deployment?
   RELEASE-CHECKLIST §3) before touching application code.
5. **Do not hot-fix state in the database.** Everything in the §2 NEVER
   list applies doubly mid-incident.
6. **Write down what happened** while it is fresh: times, affected
   `orderId`s/`deliveryId`s, what the gateway showed, what you ran. Never
   include secrets, signatures, or full webhook payloads in the incident
   note.

---

## 6. Live concurrency drill (Q-17) — staging only, owner-run

Purpose: prove the live PostgreSQL behaviour the mocked tests cannot —
row-lock timing for `settle_and_publish` (migration 0004), the partial
unique index (migration 0005), and exactly-once settlement under real
redeliveries. NEVER run against production data or with real customer
orders.

Preconditions: a staging Supabase project with migrations 0001+0002
applied (and 0003 if applied in prod order), then **0004 applied BEFORE
the Round-3.7 build is deployed to staging** (per 0004's own deploy
sequence — code-first fails closed with webhook 500s), the 0005
pre-flight report run clean on staging and **0005 applied**, a
staging/test YouPI instance or gateway test mode, two test accounts,
and a SQL Editor open on `RECONCILIATION.sql`.

Steps:

1. **Baseline:** run Q1–Q7; expect zero rows. Save the output.
2. **Double-submit race (0005 + reuse):** create a draft invite; open
   checkout in two browser sessions at once and submit both. Expect:
   both clients receive the SAME order id, exactly one order row
   exists, and completing the payment once settles and publishes once.
   Then — this is the open YouPI question **G1**, and the drill is
   where it gets answered — invoke `pay()` a second time on that same
   order id from the other session and RECORD what the gateway does
   (resumes the same order / rejects as already-paid / collects a
   second payment). Do not assert an outcome in advance: if it
   collects again, Q-16 stays PARTIALLY FIXED, the observation goes
   into the backlog's G1 entry verbatim, and the duplicate is
   refunded at the test gateway.
3. **Redelivery idempotency:** redeliver the same SUCCESS webhook from
   the gateway panel twice (fresh delivery IDs) and once more after
   settlement: expect no second publication, no state change,
   deliveries recorded once each.
4. **Archived conflict:** pay for a second invite, archive it before
   redelivering the SUCCESS webhook: expect the recorded conflict
   outcome, order paid, invite still archived; Q5 lists it.
5. **Refund vs. settlement, both orders (the 0004 lock drill):**
   a. Refund-first: settle an order paid, refund it at the test
      gateway (status → 'refunded' via the owner's process), then
      redeliver its SUCCESS webhook: expect the refunded outcome, no
      publication; Q6a/Q6b re-run clean.
   b. Lock-blocking: in the SQL Editor, session 1 runs
      `begin; select * from orders where id = '<test order>' for update;`
      and HOLDS the transaction open. Trigger a SUCCESS redelivery for
      that order from the gateway panel: the webhook's
      `settle_and_publish` call must BLOCK on the order row lock (the
      request hangs; nothing is recorded, nothing publishes). Session
      1 then runs `update orders set status = 'refunded' where id =
      '<test order>'; commit;` — the blocked call completes with the
      refunded outcome and NO publication. This is the exact window
      Round 3.7 closed; on the pre-3.7 code the same drill published
      the invite.
6. **Re-run Q1–Q7:** only the rows steps 2 and 4 deliberately created
   may appear (clean them up afterwards).
7. **Function ACL check (0004 lockdown, live proof):** in the SQL
   Editor run
   `select has_function_privilege('anon', 'public.settle_and_publish(uuid, text)', 'execute')`
   and the same with `'authenticated'` — BOTH must return `false`
   (and `'service_role'` must return `true`). The migration's
   revoke/grant is reviewed-only until this is observed live: a
   project with nonstandard default privileges would not be covered
   by the three roles the migration names.
8. **23505 propagation check (staging only — proves the
   late-settlement translation end to end):** stage the Reviewer-A
   sequence on staging: order A for a test invite → mark it `failed`
   via a FAILED webhook → create successor order B for the same
   invite through the API → deliver A's late SUCCESS webhook from
   the gateway panel. Expect: HTTP 200 with
   `{"status":"conflict","reason":"duplicate_active_order"}`, the
   delivery recorded, A still `failed`, Q7 listing A. This proves
   the 23505 code survives the plpgsql → PostgREST → supabase-js
   boundary intact, which the application translation keys on. If
   the webhook instead 500s, the code did NOT survive the boundary:
   stop — that is a release blocker, and every late settlement
   would brick silently.
9. **(Optional / advanced) Deadlock-abort behaviour under the
   FK-cascade interleave:** the shipped FK actions are multi-row
   (deleting an invite updates its orders via `ON DELETE SET
   NULL`), so an invite delete concurrent with a settlement for one
   of its orders CAN form a lock cycle with the RPC. Postgres
   aborts one side with 40P01. To observe it: hold a settlement in
   flight (step 5b's held lock) while deleting the test invite in a
   second session. Expect exactly one side to abort; if it is the
   webhook side, the response is a retryable 500 with nothing
   recorded; if it is the delete, the delete fails loudly. Either
   outcome passes — a published-but-refunded or paid-but-lost state
   fails. Advanced because staging the interleave deterministically
   is fiddly; skip it rather than fake it.

Pass criteria: every expectation above holds. Fail/stop criteria: any
duplicate publication, any paid→failed or refunded overwrite, any
unrecorded fulfilment, any second order row in step 2 — stop, preserve
all rows, and treat it as a release blocker. Record the drill date,
build/commit, the step-2 G1 observation, and outputs in the mission
evidence folder; mocked tests are NOT evidence for this drill.
