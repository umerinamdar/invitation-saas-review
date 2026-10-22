-- =====================================================================
-- CONCURRENCY DRILL — settle_and_publish (migration 0004) vs a manual
-- refund UPDATE. This is the SQL-level form of OPS-RUNBOOK.md §6
-- step 5b; it proves the Round-3.7 invariant on a REAL PostgreSQL:
-- a refund that lands as an orders-row UPDATE serializes strictly
-- before the function's status check, or strictly after its commit.
--
-- *** STAGING OR LOCAL POSTGRES ONLY. NEVER PRODUCTION DATA. ***
-- Use only the throwaway fixture rows created in SETUP below. The
-- manual 'refunded' flip mimics the owner's real out-of-band refund
-- exactly (a plain single-row UPDATE of orders.status — app code
-- never writes 'refunded').
--
-- You need TWO SQL sessions (two SQL Editor tabs / two psql
-- connections) against the same staging project, plus migration 0004
-- applied. Steps are labelled by session. PASS/FAIL criteria are
-- stated per drill; a FAIL means the invariant does not hold on the
-- live database — do not enable payments.
-- =====================================================================

-- ---------------------------------------------------------------------
-- SETUP (once, either session). Substitute an existing STAGING test
-- profile id for <TEST_USER_ID> (a profiles row from a test
-- account). Note the two returned ids as <INVITE_ID> / <ORDER_ID>.
-- ---------------------------------------------------------------------
insert into public.invites (user_id, slug, theme_id, status)
values ('<TEST_USER_ID>', 'drill37-' || substr(gen_random_uuid()::text, 1, 8),
        'drill', 'draft')
returning id;  -- <INVITE_ID>

insert into public.orders (user_id, invite_id, amount_minor, currency, status)
values ('<TEST_USER_ID>', '<INVITE_ID>', 59900, 'INR', 'created')
returning id;  -- <ORDER_ID>

-- ---------------------------------------------------------------------
-- DRILL A — refund commits BEFORE the function takes the lock
-- (proves guarantee clause (a): the function observes 'refunded').
-- ---------------------------------------------------------------------
-- SESSION 2 (run FIRST):
update public.orders set status = 'refunded' where id = '<ORDER_ID>';
-- (autocommit: commits immediately)

-- SESSION 1:
select public.settle_and_publish('<ORDER_ID>'::uuid, 'drill-pay-A');
-- EXPECTED: returns 'refunded'; zero writes.

-- VERIFY (either session):
select status from public.orders  where id = '<ORDER_ID>';  -- refunded
select status, published_at from public.invites where id = '<INVITE_ID>';
-- EXPECTED: draft, published_at null.
-- PASS iff both hold. FAIL iff the function returns a settled_*
-- outcome or the invite is published.

-- RESET for Drill B:
update public.orders set status = 'created', paid_at = null,
       gateway_payment_id = null where id = '<ORDER_ID>';

-- ---------------------------------------------------------------------
-- DRILL B — refund attempts WHILE the function is blocked on the
-- order lock (= runbook §6 step 5b). Proves serialization: the
-- blocked SELECT ... FOR UPDATE re-reads the newest committed row
-- under READ COMMITTED and classifies 'refunded' — not a stale
-- snapshot, not an error.
-- ---------------------------------------------------------------------
-- SESSION 1 (lock holder — stands in for an in-flight settlement):
begin;
select * from public.orders where id = '<ORDER_ID>' for update;
-- INTERLEAVE POINT 1: leave this transaction OPEN. Do not commit.

-- SESSION 2 (the settlement):
select public.settle_and_publish('<ORDER_ID>'::uuid, 'drill-pay-B');
-- EXPECTED: the call BLOCKS (no result; the statement hangs).
-- Nothing is recorded or published while it hangs.

-- OBSERVE (SESSION 3, optional): the RPC session is waiting on a lock:
--   select pid, wait_event_type, wait_event, state
--   from pg_stat_activity where wait_event_type = 'Lock';
-- EXPECTED: one row, wait_event_type 'Lock' (transactionid or tuple).

-- SESSION 1 (now land the refund inside the held transaction):
update public.orders set status = 'refunded' where id = '<ORDER_ID>';
commit;
-- EXPECTED SEQUENCE: Session 2's blocked call now completes and
-- returns 'refunded' (its FOR UPDATE re-read sees the committed
-- refund). It must NOT return settled_* and must NOT publish.

-- VERIFY:
select status from public.orders  where id = '<ORDER_ID>';  -- refunded
select status, published_at from public.invites where id = '<INVITE_ID>';
-- EXPECTED: draft, null.
-- PASS iff: the call visibly blocked, then returned 'refunded', and
-- the invite is unpublished.
-- FAIL iff: it returned settled_*, errored (e.g. could not serialize
-- / 40001), or published.

-- RESET for Drill C: same UPDATE as after Drill A.

-- ---------------------------------------------------------------------
-- DRILL C — refund attempts WHILE settle_and_publish itself holds
-- the locks. Proves the other direction: the function's check and
-- publish are one transaction; the refund serializes strictly AFTER
-- commit, producing the documented NOT-covered state — refund after
-- legitimate publication — never a mid-state.
-- ---------------------------------------------------------------------
-- SESSION 1:
begin;
select public.settle_and_publish('<ORDER_ID>'::uuid, 'drill-pay-C');
-- EXPECTED (inside the open transaction): returns
-- 'settled_published'; the order is 'paid' and the invite
-- 'published' IN THIS SESSION's view. Leave the transaction OPEN.

-- SESSION 2 (the refund):
update public.orders set status = 'refunded' where id = '<ORDER_ID>';
-- EXPECTED: BLOCKS on Session 1's order-row lock (observable via
-- pg_stat_activity as in Drill B). It does not error and does not
-- slip between the function's check and publish — there is no
-- between: both writes are in Session 1's transaction.

-- SESSION 1:
commit;
-- EXPECTED SEQUENCE: Session 2's UPDATE now applies and commits.
-- Final state: order 'refunded' + invite 'published'. That is the
-- documented policy case (refund AFTER legitimate publication):
-- RECONCILIATION.sql Q6a must list this order (run Q6a now — expect
-- exactly this row), and runbook §2.2 is the response. It is NOT a
-- drill failure.
-- PASS iff: Session 2 blocked until commit; no error on either
-- side; the final state is exactly refunded+published and Q6a sees
-- it.
-- FAIL iff: the refund updated the row before Session 1 committed,
-- or Session 1's publish was lost.

-- ---------------------------------------------------------------------
-- CLEANUP (after all drills): remove the fixture entirely.
-- ---------------------------------------------------------------------
delete from public.orders  where id = '<ORDER_ID>';
delete from public.invites where id = '<INVITE_ID>';
-- (Order matters only for tidiness: deleting the invite first would
-- SET NULL the order's invite_id per the 0001 FK.)
