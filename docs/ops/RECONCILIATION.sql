-- =====================================================================
-- RECONCILIATION.sql — EasyInviteMaker payment reconciliation queries
--
-- DOCUMENTATION ONLY. These queries were drafted during the Round-2
-- webhook resilience audit (master prompt §5.12 / §7.6). They have
-- NEVER been executed against any database — not in this workspace
-- (no live DB access exists here) and they must not be wired into any
-- automated job without owner review.
--
-- How to use: the owner runs them manually, read-only, in the
-- Supabase SQL Editor (or psql) against the LIVE project, e.g.
-- weekly and after any gateway incident. Every query is a plain
-- SELECT; none of them mutates anything. What to do with results is
-- noted per query. Column names verified against migrations
-- 0001_init.sql + 0002_webhook_deliveries.sql (2026-10-21).
-- Precision note (Round 3.7): that verification covers TABLE
-- columns. The payload keys Q3/Q4/Q5 rely on ('event', 'orderId',
-- 'paymentId' inside webhook_deliveries.payload) exist in NO
-- migration — their basis is the webhook handler code that writes
-- them (src/routes/api/webhooks/youpi.ts, src/lib/orders-server.ts),
-- re-verified against the code on 2026-10-22.
--
-- Query inventory: Q1 paid-but-unpublished · Q2 stuck created ·
-- Q3 recorded-without-fulfilment · Q4 paid-without-delivery ·
-- Q5 paid-but-archived · Q6a refunded-but-published · Q6b multiple
-- paid orders per invite · Q7 late-settlement conflicts (the
-- migration-0005 interaction, added in the Round-3.7 adversarial
-- review) · Q8 second gateway payment on one order (the G1
-- residual, added in impl round 2, Agent D).
--
-- Schema facts relied on:
--   orders(id, user_id, invite_id, amount_minor, currency, gateway,
--          gateway_order_id, gateway_payment_id,
--          status in ('created','paid','failed','refunded'),
--          created_at, paid_at)
--   invites(id, user_id, slug, status in ('draft','published',
--          'archived'), published_at)
--   webhook_deliveries(id, delivery_id UNIQUE, payload jsonb,
--          created_at)  -- payload holds the full signed webhook body,
--                       -- including orderId / paymentId / utr fields.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Q1. PAID BUT NOT PUBLISHED
-- Orders the webhook marked paid whose invitation never reached
-- 'published'. Since the scenario-14 fix, a redelivery self-heals
-- this (the plan returns publish_only), so a row here means either
-- the fix is not deployed yet, the invite was later unpublished /
-- archived by hand, or every redelivery also failed.
-- Action: check the gateway still shows the payment as SUCCESS, then
-- either ask the gateway to redeliver the webhook, or publish the
-- invite manually from the dashboard. Do NOT mark anything paid by
-- hand — payment state comes only from verified webhooks.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  i.slug,
  i.status        as invite_status,
  o.amount_minor,
  o.currency,
  o.gateway_payment_id,
  o.paid_at,
  now() - o.paid_at as paid_age
from orders o
left join invites i on i.id = o.invite_id
where o.status = 'paid'
  and (o.invite_id is null or i.status is distinct from 'published')
order by o.paid_at asc;


-- ---------------------------------------------------------------------
-- Q2. STUCK PENDING ORDERS (created > 24 hours, never settled)
-- Checkout was initiated but no terminal webhook outcome was ever
-- recorded: abandoned checkout, lost webhook, or a payment the
-- gateway settled without notifying us.
-- Action: look each gateway_payment_id / order up in the YouPI
-- merchant view. If the gateway shows SUCCESS but we never got the
-- webhook, request a redelivery from the gateway (do not fulfil by
-- hand). If it shows nothing, the order was simply abandoned and can
-- be left to age out.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  o.amount_minor,
  o.currency,
  o.gateway_order_id,
  o.created_at,
  now() - o.created_at as pending_age
from orders o
where o.status = 'created'
  and o.created_at < now() - interval '24 hours'
order by o.created_at asc;


-- ---------------------------------------------------------------------
-- Q3. RECORDED DELIVERIES WITHOUT FULFILMENT
-- webhook_deliveries rows are written ONLY after fulfilment (or for
-- no-op/unknown events). A delivery whose order is still in 'created'
-- is therefore an anomaly worth eyeballing: legitimately it happens
-- for unknown-event deliveries and already-settled replays; anything
-- else suggests the order was reset or the payload references an
-- order this project does not know (then the join yields NULLs).
-- Action: inspect the payload's event field for the rows returned.
-- SUCCESS-event rows here with a 'created' order need investigation
-- before any redelivery is attempted.
-- ---------------------------------------------------------------------
select
  wd.delivery_id,
  wd.created_at   as delivered_at,
  wd.payload ->> 'event'     as event,
  wd.payload ->> 'orderId'   as payload_order_id,
  wd.payload ->> 'paymentId' as payload_payment_id,
  o.id            as order_id,
  o.status        as order_status
from webhook_deliveries wd
left join orders o on o.id::text = wd.payload ->> 'orderId'
where o.id is null
   or o.status = 'created'
order by wd.created_at desc;


-- ---------------------------------------------------------------------
-- Q4. PAID ORDERS WITH NO RECORDED DELIVERY (cross-check)
-- Every legitimate paid marking happens inside the webhook handler,
-- which records the delivery immediately after fulfilment. A paid
-- order with no matching delivery row means the status was changed
-- outside the webhook path (manual SQL, a dashboard bug, or a lost
-- record) — a red flag, because paid state must only ever come from
-- a verified webhook + gateway lookup.
-- Action: treat any row here as an incident: identify who/what set
-- the status before trusting the order.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  o.gateway_payment_id,
  o.paid_at
from orders o
where o.status = 'paid'
  and not exists (
    select 1
    from webhook_deliveries wd
    where wd.payload ->> 'orderId' = o.id::text
      and wd.payload ->> 'event' = 'SUCCESS'
  )
order by o.paid_at asc;


-- ---------------------------------------------------------------------
-- Q5. PAID BUT ARCHIVED (added Round 3 / WS2)
-- Orders that are paid while their invitation is 'archived'. Since
-- the Round-3 fix, the webhook NEVER publishes an archived invite:
-- the corroborated payment is recorded as paid, the delivery is
-- recorded, the handler answers 200 with a "conflict" outcome and
-- logs an error line ("Webhook fulfilment conflict"). A row here is
-- therefore an expected-but-manual case, not an automatic retry
-- candidate: the customer paid for a publication the owner retired.
-- Action: a HUMAN decides per case — either un-archive + publish the
-- invite manually from the dashboard (if the archival was a mistake),
-- or refund the payment AT THE GATEWAY (the app never fabricates a
-- refund; orders.status only becomes 'refunded' through the owner's
-- own process). Do NOT re-run the webhook expecting it to publish:
-- it will keep answering conflict by design. Cross-check the
-- delivery rows to confirm each was a verified SUCCESS.
-- (Round 3.7, corrected in Round-3.7 adversarial review A: the
-- LEFT JOIN below emits one row per recorded SUCCESS delivery for
-- the order, so a conflict redelivered under fresh delivery IDs
-- would otherwise appear once per delivery. DISTINCT ON (o.id)
-- collapses that to ONE row per order, showing the MOST RECENT
-- recorded SUCCESS delivery as the representative. A plain SELECT
-- DISTINCT could not do this: delivery_id / created_at are in the
-- select list, so per-delivery rows are never exact duplicates.)
-- ---------------------------------------------------------------------
select
  q.order_id,
  q.user_id,
  q.invite_id,
  q.slug,
  q.invite_status,
  q.amount_minor,
  q.currency,
  q.gateway_payment_id,
  q.paid_at,
  q.delivery_id,
  q.conflict_delivery_at
from (
  select distinct on (o.id)
    o.id            as order_id,
    o.user_id,
    o.invite_id,
    i.slug,
    i.status        as invite_status,
    o.amount_minor,
    o.currency,
    o.gateway_payment_id,
    o.paid_at,
    wd.delivery_id,
    wd.created_at   as conflict_delivery_at
  from orders o
  join invites i on i.id = o.invite_id
  left join webhook_deliveries wd
    on wd.payload ->> 'orderId' = o.id::text
   and wd.payload ->> 'event' = 'SUCCESS'
  where o.status = 'paid'
    and i.status = 'archived'
  order by o.id, wd.created_at desc
) q
order by q.paid_at asc;


-- ---------------------------------------------------------------------
-- Q6. TERMINAL-STATE RESIDUES (added Round 3.6 verification)
-- Two residues no earlier query surfaces, because Q1/Q4/Q5 all key
-- on status = 'paid':
--
-- Q6a. REFUNDED BUT PUBLISHED — a refunded order whose invitation
-- is live even though NO paid order funds it. Two sources:
-- (1) the pre-Round-3.7 micro-window (a refund landing between the
-- old code's separate mark-paid and publish statements) — CLOSED
-- once migration 0004 (settle_and_publish) is applied and the
-- Round-3.7 code is deployed, because settlement and publication
-- are then one transaction under the order row lock; and
-- (2) a refund that lands AFTER a legitimate publication — no
-- publish-side design can prevent that ordering; it is an owner
-- policy case (today: no auto-unpublish; this query + runbook
-- §2.2 are the response). This query is a DETECTION control, not
-- prevention.
-- The NOT EXISTS guard matters: without it, this query also fires
-- for the RESOLVED duplicate-charge case — order A paid and
-- published the invite, duplicate order B paid and was refunded —
-- where the publication is still funded by A and must NOT be taken
-- down. The guard restricts rows to invites with no surviving
-- paid order; runbook §2.2 still re-checks by hand before acting.
-- Action (full procedure: OPS-RUNBOOK.md §2.2): corroborate at the
-- gateway that the refund is the final money state, then
-- unpublish/archive the invite from the dashboard.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  i.slug,
  i.status        as invite_status,
  o.amount_minor,
  o.currency,
  o.gateway_payment_id,
  o.paid_at
from orders o
join invites i on i.id = o.invite_id
where o.status = 'refunded'
  and i.status = 'published'
  and not exists (
    select 1
    from orders p
    where p.invite_id = o.invite_id
      and p.status = 'paid'
  )
order by o.paid_at asc;

-- ---------------------------------------------------------------------
-- Q6b. MULTIPLE PAID ORDERS PER INVITE — the duplicate-checkout
-- residue (Q-16): two separately completed gateway checkouts for
-- one invitation both settled as paid orders. Publication is still
-- capped at one (the invite can only transition draft → published
-- once), but the customer was charged more than once.
-- Action: refund the duplicate payment(s) at the gateway, keeping
-- the earliest paid order as the legitimate one (procedure:
-- OPS-RUNBOOK.md §2.1). Prevention status (Round 3.7, Q-16
-- PARTIALLY FIXED): the Option-D fix — API active-order reuse +
-- migration 0005's partial unique index — is implemented in code
-- with the migration file prepared but NOT applied; once 0005 is
-- applied and the code deployed, duplicate ORDERS can no longer be
-- created. Duplicate CHARGES are additionally gated on YouPI
-- enforcing one successful payment per order_id (owner question
-- G1, unanswered). Until both land, and for any historical rows,
-- this query is the detection control — it is not prevention.
-- Limits: it is a current-state detector (once the duplicate is
-- refunded the row disappears; the historical evidence then lives
-- only at the gateway), and paid orders whose invite was deleted
-- (invite_id set NULL) are excluded by the filter below.
-- ---------------------------------------------------------------------
select
  o.invite_id,
  count(*)          as paid_orders,
  sum(o.amount_minor) as total_charged_minor,
  min(o.paid_at)    as first_paid_at,
  max(o.paid_at)    as last_paid_at
from orders o
where o.status = 'paid'
  and o.invite_id is not null
group by o.invite_id
having count(*) > 1
order by first_paid_at asc;

-- ---------------------------------------------------------------------
-- Q7. LATE-SETTLEMENT CONFLICTS (added Round 3.7 adversarial review)
-- Orders still in 'failed' (or 'created') even though a SUCCESS
-- delivery for them was RECORDED. The 'failed' rows are the blind
-- spot of Q1–Q6: those key on 'paid' (Q1/Q4/Q5/Q6b), on 'created'
-- WITHOUT regard to recorded deliveries (Q2), on recorded
-- deliveries whose order is missing or 'created' only (Q3), or on
-- 'refunded' (Q6a) — a bricked order is none of those.
-- Cause (once migration 0005 is live): the order's payment
-- genuinely settled at the gateway LATE — after the order had been
-- marked 'failed' (gateway timeout, or retired by the 0005
-- cleanup) and a successor order had taken the invite's active
-- slot. The settle RPC's mark-paid UPDATE then violates 0005's
-- partial unique index (23505) and aborts; the handler translates
-- that into a RECORDED conflict (reason 'duplicate_active_order')
-- instead of an endless 500 loop. The money DID move at the
-- gateway; only the database transition is blocked.
-- Action (full procedure: OPS-RUNBOOK.md §2.1, late-settlement
-- case): verify at the gateway that this order's payment really
-- settled (payload_payment_id below). Normally it is a genuine
-- duplicate — the successor order is the live one — so refund THIS
-- payment at the gateway. If this order is the ONLY real payment
-- (the successor never actually collected), retire the successor
-- order to 'failed' (freeing the active slot), then have the
-- gateway send a FRESH delivery for this payment: re-sending the
-- SAME delivery id answers already_processed, because the conflict
-- delivery was recorded — a fresh delivery, or manual owner
-- resolution, is required. Never flip statuses by hand without
-- the gateway corroboration first.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  o.status        as order_status,
  o.amount_minor,
  o.currency,
  wd.delivery_id,
  wd.created_at   as conflict_recorded_at,
  wd.payload ->> 'paymentId' as payload_payment_id
from orders o
join webhook_deliveries wd
  on wd.payload ->> 'orderId' = o.id::text
 and wd.payload ->> 'event' = 'SUCCESS'
where o.status in ('failed', 'created')
order by wd.created_at asc;


-- ---------------------------------------------------------------------
-- Q8. SECOND GATEWAY PAYMENT ON ONE ORDER (added impl round 2,
-- Agent D — the G1 residual detector)
-- The one duplicate-charge shape Q6b cannot see: TWO successful
-- gateway payments against ONE order row (concurrent gateway
-- sessions on a reused 'created' order, or a retry that succeeded
-- inside webhook latency). The database stays consistent — the
-- order is paid once, by the FIRST payment id recorded in
-- orders.gateway_payment_id — and the second delivery records as
-- already_paid, so no state query notices it. The only trace is the
-- second delivery's payload: a SUCCESS event for this orderId
-- carrying a paymentId DIFFERENT from the one stored on the order.
-- Action: any row here is a real second charge at the gateway.
-- Refund the LATER payment (payload_payment_id below) at the
-- gateway; the stored gateway_payment_id is the legitimate one.
-- Detection only — prevention is the gateway's one-success-per-
-- order_id behaviour (owner question G1, unanswered) plus the
-- G1-SANDBOX-PROTOCOL; this query is why the residual risk is
-- safe to carry knowingly rather than silently.
-- ---------------------------------------------------------------------
select
  o.id            as order_id,
  o.user_id,
  o.invite_id,
  o.gateway_payment_id  as recorded_payment_id,
  wd.payload ->> 'paymentId' as payload_payment_id,
  wd.delivery_id,
  wd.created_at   as second_payment_recorded_at,
  o.paid_at
from orders o
join webhook_deliveries wd
  on wd.payload ->> 'orderId' = o.id::text
 and wd.payload ->> 'event' = 'SUCCESS'
where o.status = 'paid'
  and o.gateway_payment_id is not null
  and wd.payload ->> 'paymentId' is distinct from o.gateway_payment_id
order by wd.created_at asc;
