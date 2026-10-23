-- =====================================================================
-- VERIFY-0007 — post-apply verification pack for migration 0007
-- (profiles.is_admin + admin read policies, admin dashboard v1).
--
-- OWNER-RUN, AFTER applying supabase/migrations/0007_admin_role.sql
-- and BEFORE flagging any account as admin.
--
-- V1–V2 are pure SELECTs, run in the Supabase SQL Editor. V3–V4 are
-- BEHAVIOURAL checks and must run as real authenticated users over
-- REST (the RLS-VERIFICATION.sql Block D method): the SQL Editor
-- runs as the postgres role, which bypasses column privileges and
-- RLS entirely, so an UPDATE typed into the Editor proves NOTHING
-- about what a signed-in user can do — it would succeed there even
-- if the lock were missing. Do not substitute Editor runs for V3/V4.
--
-- Expected result for every check is written above it. Any deviation
-- = STOP: do not flag the owner account, do not rely on /admin.
-- =====================================================================

-- ---------------------------------------------------------------------
-- V1 — The flag column exists, with the safe default.
-- Expected: EXACTLY ONE row; data_type 'boolean';
-- column_default 'false'; is_nullable 'NO'. Zero rows = 0007 not
-- applied (or applied to a different project). A default other than
-- false, or a nullable column, means new signups could start out
-- flagged or unknown — stop.
-- ---------------------------------------------------------------------
select column_name,
       data_type,
       column_default,
       is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'is_admin';

-- ---------------------------------------------------------------------
-- V2 — Column-privilege lock (the check that matters most).
-- Expected: authenticated_can_update_is_admin = false, and the two
-- legitimate profile columns remain updatable (both true) so the
-- lock did not over-revoke.
-- ---------------------------------------------------------------------
select has_column_privilege('authenticated',
         'public.profiles', 'is_admin', 'UPDATE')
         as authenticated_can_update_is_admin,
       has_column_privilege('authenticated',
         'public.profiles', 'full_name', 'UPDATE')
         as authenticated_can_update_full_name,
       has_column_privilege('authenticated',
         'public.profiles', 'phone', 'UPDATE')
         as authenticated_can_update_phone;

-- Cross-check the raw grants. Expected UPDATE rows for grantee
-- 'authenticated' on profiles: EXACTLY full_name and phone —
-- no UPDATE row naming is_admin (nor id / created_at). Read the
-- remaining rows as the record of everything else the role holds on
-- this table; anything unexpected here is a stop-and-review, the
-- same discipline as the policy inventory in RLS-VERIFICATION.sql
-- Block C.
select grantee,
       column_name,
       privilege_type
from information_schema.column_privileges
where table_schema = 'public'
  and table_name = 'profiles'
  and grantee = 'authenticated'
order by privilege_type, column_name;

-- ---------------------------------------------------------------------
-- V3 — Behavioural: a signed-in user CANNOT flag themselves.
-- Run over REST as a throwaway test account (Block D setup: create
-- the user in Dashboard → Authentication → Users, sign in via
-- POST /auth/v1/token?grant_type=password, use its access token).
-- Placeholders: <SB> project URL, <ANON> publishable/anon key,
-- <TOK_TEST> the test user's access token, <TEST_UUID> its id.
--
--   curl -s -X PATCH "<SB>/rest/v1/profiles?id=eq.<TEST_UUID>" \
--     -H "apikey: <ANON>" -H "Authorization: Bearer <TOK_TEST>" \
--     -H "Content-Type: application/json" \
--     -H "Prefer: return=representation" \
--     -d '{"is_admin": true}'
--
-- Expected: HTTP 403 with a permission-denied error (Postgres
-- 42501, naming the is_admin column / profiles table) — NOT a
-- silent success and NOT an empty 200/204. Then confirm the flag
-- did not move:
--
--   curl -s "<SB>/rest/v1/profiles?id=eq.<TEST_UUID>&select=is_admin" \
--     -H "apikey: <ANON>" -H "Authorization: Bearer <TOK_TEST>"
--
-- Expected: [{"is_admin": false}]. FAIL: the PATCH succeeded, or
-- the follow-up read shows true — the column lock is not live and
-- ANY signed-up user can make themselves admin. Do not launch
-- /admin while this fails. (Sanity counter-check, same token:
-- PATCH {"full_name": "Test"} must SUCCEED — the two granted
-- columns stay editable.)
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
-- V4 — Behavioural: admin sees everything, non-admins unchanged.
-- Setup: two ordinary test accounts (<TOK_A>, <TOK_B>) who each own
-- at least one order and one invite, plus a third test account
-- flagged admin for this check only, via the manual statement in
-- 0007's header (replace the placeholder email with the TEST admin
-- account's — never leave a throwaway account flagged afterwards).
-- All calls send -H "apikey: <ANON>" and the stated bearer token.
--
-- (a) Admin reads across users:
--   curl -s "<SB>/rest/v1/orders?select=id,user_id,status" -H "Authorization: Bearer <TOK_ADMIN>"
--   curl -s "<SB>/rest/v1/invites?select=id,user_id,status" -H "Authorization: Bearer <TOK_ADMIN>"
--   Expected: rows belonging to BOTH test users (plus any real
--   rows). FAIL: only the admin account's own rows — the
--   "admin reads all ..." policies are missing or is_admin() is
--   not resolving.
--
-- (b) Non-admin visibility is byte-identical to pre-0007:
--   curl -s "<SB>/rest/v1/orders?select=id,user_id,status" -H "Authorization: Bearer <TOK_A>"
--   Expected: ONLY A's orders (the 0001 "read own orders" outcome,
--   unchanged). FAIL: any row with user_id ≠ A — the additive
--   policies leaked, which is the one failure this migration must
--   never produce.
--   curl -s "<SB>/rest/v1/invites?select=id,user_id,status" -H "Authorization: Bearer <TOK_A>"
--   Expected: A's own invites (any status) plus other users'
--   PUBLISHED invites — exactly the pre-0007 outcome of "own
--   invites" OR "published invites are public". FAIL: another
--   user's DRAFT or ARCHIVED invite appears.
--
-- (c) The flag itself stays owner-only information:
--   curl -s "<SB>/rest/v1/profiles?select=id,is_admin" -H "Authorization: Bearer <TOK_A>"
--   Expected: ONLY A's own row. FAIL: other users' profile rows.
--
-- CLEANUP: unflag the test admin (set is_admin = false) or delete
-- the test accounts in Dashboard → Authentication → Users, and
-- delete their test invites/orders, as in Block D's cleanup.
-- =====================================================================
