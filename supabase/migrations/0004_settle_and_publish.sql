-- =====================================================================
-- NOT APPLIED — DO NOT RUN BLINDLY.
-- This migration is delivered as a file for owner review. The owner
-- applies it manually in Supabase → SQL Editor → New query → Run,
-- after confirming 0001_init.sql and 0002_webhook_deliveries.sql are
-- live. Prepared 2026-10-22 (Round 3.7 / Part 2).
-- =====================================================================
--
-- DEPLOY ORDER — READ FIRST (this is the reverse of 0003):
-- this migration must be applied BEFORE the Round-3.7 application
-- code is deployed. The webhook handler calls this function via
-- PostgREST RPC; if the code deploys first, every fulfilment fails
-- CLOSED (PGRST202 "function not found" → handler 500 → nothing is
-- recorded, nothing is falsely fulfilled, and gateway redeliveries
-- retry once the function exists). Safe sequence:
--   0. Confirm migrations 0001 + 0002 are actually applied live
--      (table list shows orders, invites, webhook_deliveries, ...).
--   1. Apply this migration.
--   2. Smoke-check the function exists and is callable by the
--      service role only:
--        select public.settle_and_publish(
--          '00000000-0000-0000-0000-000000000000'::uuid, 'smoke');
--      Expected: 'not_found' (a random uuid settles nothing).
--   3. Deploy the Round-3.7 code.
--   4. Watch the first real webhook deliveries + run
--      docs/RECONCILIATION.sql.
-- Rollback = redeploy the previous code (it never calls this
-- function); the function may then stay (unused, execute revoked
-- below) or be dropped via the rollback block at the bottom.
--
-- Why: webhook fulfilment used to be two separate PostgREST
-- statements — markOrderPaid (a conditional UPDATE on orders) and
-- then publishInvite (a conditional UPDATE on invites). A refund is
-- an out-of-band action (the owner refunds at the gateway, then
-- flips orders.status to 'refunded'); nothing stopped it from
-- landing BETWEEN a won mark-paid and the publish, and publishInvite
-- looked only at the invite — so a refunded customer's invitation
-- was still published. No re-read can close that gap: the check and
-- the publish must be one transaction holding the order's row lock,
-- and PostgREST gives application code no way to hold a lock across
-- requests. This function is that transaction.
--
-- How the guarantee works: EVERY update of an orders row — this
-- function, markOrderFailed, the owner's manual refund flip — must
-- acquire the row's write lock. By taking SELECT ... FOR UPDATE on
-- the order FIRST and holding it until commit, a concurrent refund
-- is serialized either strictly before the status check below (the
-- function observes 'refunded' and publishes nothing) or strictly
-- after the whole settlement commits (a refund of an already
-- legitimately published invite — a product-policy case detected
-- by RECONCILIATION.sql Q6a, not preventable publish-side).
-- Lock order is FIXED: orders row first, invites row second,
-- everywhere. Among application writers this function is the only
-- multi-row transaction; every other application writer is
-- single-row and can block on it but cannot cycle with it. A lock
-- cycle IS still possible, though, from the shipped schema's FK
-- referential actions: deleting an invite takes the invite row
-- lock and then updates its orders (ON DELETE SET NULL), and
-- deleting a profile cascades invites -> orders. Run concurrently
-- with this function (which holds the order lock and wants the
-- invite lock), such a delete can form a genuine cycle. Postgres
-- detects it and aborts ONE side with 40P01: if this function is
-- the victim, the webhook caller treats the RPC error as a
-- retryable 500 — nothing recorded, and redelivery retries; if
-- the delete is the victim, the owner's delete fails loudly.
-- Either way no invariant breaks and no false outcome is
-- produced — a deadlock victim is a delay, never a false
-- outcome. The same covers a future multi-statement script that
-- updates invites BEFORE orders: it would invert the order and
-- meet the same 40P01 abort. (Full reasoning:
-- docs/ADR-settle-and-publish.md.)
--
-- SECURITY — the revoke below is part of the fix, not decoration:
-- Postgres grants EXECUTE on new functions to PUBLIC by default and
-- PostgREST exposes public-schema functions as API endpoints.
-- Without the revoke, ANY signed-in user could call this function
-- on their own order id and mark themselves paid + published
-- WITHOUT PAYING. EXECUTE is granted to service_role only; the
-- webhook handler is the sole caller and runs on the service role.

create or replace function public.settle_and_publish(
  p_order_id uuid,
  p_gateway_payment_id text
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_invite_status text;
begin
  -- LOCK 1: the order row. Held until this transaction commits.
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return 'not_found';
  end if;

  -- A refund is terminal: never mark, never publish.
  if v_order.status = 'refunded' then
    return 'refunded';
  end if;

  if v_order.status in ('created', 'failed') then
    -- Recovery mode (the webhook's publish_only path) passes a null
    -- payment id and must never mark an order paid.
    if p_gateway_payment_id is null then
      return 'not_paid';
    end if;
    -- The same fields markOrderPaid writes, now under the lock.
    update public.orders
    set status = 'paid',
        paid_at = now(),
        gateway_payment_id = p_gateway_payment_id
    where id = p_order_id;
  end if;

  -- The order is 'paid' at this point: it already was, or this call
  -- marked it above — either way under the lock taken first.
  if v_order.invite_id is null then
    return 'settled_no_invite';
  end if;

  -- LOCK 2: the invite row (always after the order row).
  select status into v_invite_status
  from public.invites
  where id = v_order.invite_id
  for update;

  if not found then
    -- Unreachable while the orders.invite_id FK holds; fail safe.
    return 'retryable';
  end if;

  if v_invite_status = 'published' then
    return 'settled_already_published';
  elsif v_invite_status = 'archived' then
    -- Paid but never published: the recorded-conflict outcome the
    -- webhook has produced since Round 3 (RECONCILIATION.sql Q5).
    return 'conflict_archived';
  elsif v_invite_status = 'draft' then
    -- The same fields publishInvite writes.
    update public.invites
    set status = 'published',
        published_at = now()
    where id = v_order.invite_id;
    return 'settled_published';
  end if;

  return 'retryable';
end;
$$;

-- Mandatory (see the security note in the header): only the
-- service role may execute this function.
revoke execute on function public.settle_and_publish(uuid, text)
  from public, anon, authenticated;
grant execute on function public.settle_and_publish(uuid, text)
  to service_role;

-- =====================================================================
-- ROLLBACK — commented out; NOT part of this migration. Order:
-- FIRST redeploy the previous application code (it never calls this
-- function), confirm webhook fulfilment is healthy, and only then,
-- if desired, drop the function:
-- =====================================================================
-- drop function if exists public.settle_and_publish(uuid, text);
