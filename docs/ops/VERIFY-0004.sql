-- =====================================================================
-- VERIFY-0004 — post-apply verification pack for migration 0004
-- (public.settle_and_publish, Round 3.7).
--
-- OWNER-RUN, in the Supabase SQL Editor, AFTER applying
-- supabase/migrations/0004_settle_and_publish.sql and BEFORE deploying
-- the Round-3.7 application code (RELEASE-CHECKLIST.md §1).
--
-- V1–V3 are pure SELECTs. V4 is a documented smoke call that is
-- side-effect-free BY CONSTRUCTION: the id does not exist, so the
-- function returns 'not_found' before any write. Do NOT substitute a
-- real order id into V4.
--
-- Expected result for every check is written above it. Any deviation
-- = STOP: do not deploy the code, do not enable payments.
-- =====================================================================

-- ---------------------------------------------------------------------
-- V1 — Existence + signature + security mode.
-- Expected: EXACTLY ONE row; identity_args
-- 'p_order_id uuid, p_gateway_payment_id text'; return_type 'text';
-- language 'plpgsql'; security_mode 'SECURITY INVOKER'.
-- Zero rows = 0004 not applied (or applied to a different project).
-- More than one = an overload exists — stop.
-- ---------------------------------------------------------------------
select p.proname,
       pg_get_function_identity_arguments(p.oid) as identity_args,
       pg_get_function_result(p.oid)             as return_type,
       l.lanname                                 as language,
       case when p.prosecdef then 'SECURITY DEFINER'
            else 'SECURITY INVOKER' end         as security_mode
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language  l on l.oid = p.prolang
where n.nspname = 'public'
  and p.proname = 'settle_and_publish';

-- ---------------------------------------------------------------------
-- V2 — Definition sanity (mechanical). Expected BOTH true:
-- exactly two FOR UPDATE selects, and the orders lock textually
-- precedes the invites lock in the body.
-- ---------------------------------------------------------------------
select (select count(*) from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'settle_and_publish'
          and (select count(*) from regexp_matches(p.prosrc, 'for update', 'g')) = 2)
       as two_row_locks,
       (select position('from public.orders'  in p.prosrc) <
               position('from public.invites' in p.prosrc)
        from pg_proc p
        join pg_namespace n on n.oid = p.pronamespace
        where n.nspname = 'public' and p.proname = 'settle_and_publish')
       as order_lock_first;

-- Then eyeball the full body once:
--   select pg_get_functiondef(p.oid) from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname = 'settle_and_publish';
-- Expected outcome strings present: not_found, refunded, not_paid,
-- settled_no_invite, settled_already_published, conflict_archived,
-- settled_published, retryable.

-- ---------------------------------------------------------------------
-- V3 — ACL (the lockdown).
-- Expected: anon = false, authenticated = false, service_role = true.
-- This is the check that matters most: if anon or authenticated can
-- execute settle_and_publish, any signed-in user could mark their own
-- order paid without paying.
-- ---------------------------------------------------------------------
select has_function_privilege('anon',
         'public.settle_and_publish(uuid, text)', 'execute') as anon_can_execute,
       has_function_privilege('authenticated',
         'public.settle_and_publish(uuid, text)', 'execute') as authenticated_can_execute,
       has_function_privilege('service_role',
         'public.settle_and_publish(uuid, text)', 'execute') as service_role_can_execute;

-- Cross-check the raw ACL. Expected: a service_role EXECUTE row;
-- NO 'PUBLIC' row; NO anon/authenticated rows. If proacl is NULL the
-- function carries Postgres DEFAULT privileges (= PUBLIC execute) —
-- that is a FAIL even before reading rows; the has_function checks
-- above catch it (anon would return true via PUBLIC).
select case when a.grantee = 0 then 'PUBLIC'
            else a.grantee::regrole::text end as grantee,
       a.privilege_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
cross join lateral aclexplode(p.proacl) a
where n.nspname = 'public' and p.proname = 'settle_and_publish';

-- ---------------------------------------------------------------------
-- V4 — Smoke call (documented; zero writes for a nonexistent id).
-- Expected: not_found.
-- NOTE: V4 runs as the SQL Editor's postgres role and proves
-- existence + the not_found path only. It does NOT prove the
-- service role can call it through PostgREST — V3 proves the
-- permission bit; the end-to-end proof is the first staging webhook
-- (OPS-RUNBOOK.md §6).
-- ---------------------------------------------------------------------
select public.settle_and_publish(
  '00000000-0000-0000-0000-000000000000'::uuid, 'smoke');
