-- =====================================================================
-- NOT APPLIED — DO NOT RUN BLINDLY.
-- This migration is delivered as a file for owner review. The owner
-- applies it manually in Supabase → SQL Editor → New query → Run.
-- Prepared 2026-10-24 (read-only admin dashboard v1).
-- =====================================================================
--
-- Why: EasyInviteMaker has no admin/owner role. Every RLS policy in
-- 0001 is a plain ownership check (auth.uid() = user_id), so the site
-- owner has zero special access inside the app — order/revenue
-- visibility exists only outside it (SQL Editor, gateway panel). This
-- migration adds the smallest possible read-only admin capability:
-- the owner (and only the owner) can SEE all orders, invites and
-- profiles in-app at /admin. Nothing here grants any write path.
--
-- What it does — PURELY ADDITIVE. No existing table, column, function
-- or policy is altered, dropped or re-created:
--   1. profiles gains an is_admin flag (default false).
--   2. The flag is locked at the COLUMN-PRIVILEGE level (below).
--   3. public.is_admin() — a read-only helper returning whether the
--      current caller is flagged.
--   4. Three NEW SELECT-only policies ("admin reads all ...") that
--      OR with the existing owner/public policies. Existing rows'
--      visibility for non-admins is byte-identical to before.
--
-- The one dangerous column: without step 2, the existing
-- "own profile" policy (FOR ALL, auth.uid() = id) lets any signed-in
-- user UPDATE their own profile row — including, once the column
-- exists, is_admin itself. RLS checks WHOSE row; it does not restrict
-- WHICH COLUMNS. So the block is placed where Postgres enforces it
-- before RLS even runs: the table-level UPDATE grant is revoked from
-- `authenticated` and only the two columns the product may ever let
-- a user edit are granted back. An attempt to set is_admin then
-- fails with a permission-denied error (VERIFY-0007 V2/V3) instead of
-- silently succeeding. No app code path is affected: the browser app
-- never reads or writes profiles at all (profile rows are created by
-- the 0001 handle_new_user() trigger, which runs as the function
-- owner, not as `authenticated`), and server code uses service_role.
--
-- About public.is_admin() and EXECUTE: the function only ever
-- returns a boolean and performs no writes, so the default EXECUTE
-- grant is fine and is deliberately NOT revoked (migration 0004
-- revoked execute on settle_and_publish because that function WRITES
-- privileged state — the opposite shape from this read-only check).
-- It reads only the caller's own flag: the inner query is pinned to
-- auth.uid(), so it cannot be used to probe anyone else's status.
--
-- OWNER STEP — MANUAL, AFTER APPLYING, NEVER COMMITTED AS SQL:
-- this file intentionally contains no account identifier. Once the
-- migration is applied and VERIFY-0007 V1–V4 pass, flag the owner's
-- own account by running this statement in the SQL Editor, with the
-- placeholder replaced by the owner's real sign-in email:
--
--   update profiles set is_admin = true
--   where id = (select id from auth.users
--               where email = 'OWNER_EMAIL_HERE');
--
-- Until that statement is run, NO account is an admin and /admin
-- bounces every signed-in user to /dashboard — the safe default.
--
-- DEPLOY ORDER: independent of application code in one direction —
-- the /admin route is harmless before this migration (the check
-- errors/finds no flag and bounces) and the migration is harmless
-- before the code (nothing reads is_admin yet). Apply the migration
-- first, run docs/ops/VERIFY-0007.sql, then deploy the code.
-- =====================================================================

-- 1. The flag ------------------------------------------------------------
alter table profiles add column if not exists is_admin boolean not null default false;

-- 2. Column-privilege lock ------------------------------------------------
-- Revoke the table-level UPDATE grant, then grant back UPDATE on the
-- two editable profile columns ONLY. is_admin is not in the grant
-- list, so no authenticated caller can set it — including on their
-- own row, regardless of what RLS would allow.
revoke update on profiles from authenticated;
grant update (full_name, phone) on profiles to authenticated;

-- 3. Admin check ----------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- 4. Admin read policies (SELECT-only, additive) --------------------------
-- Permissive policies combine with OR: these widen reads for flagged
-- admins and change nothing for anyone else. No INSERT/UPDATE/DELETE
-- policy is added anywhere — the admin surface stays read-only even
-- at the database layer.
drop policy if exists "admin reads all invites" on invites;
create policy "admin reads all invites" on invites
  for select using (public.is_admin());

drop policy if exists "admin reads all orders" on orders;
create policy "admin reads all orders" on orders
  for select using (public.is_admin());

drop policy if exists "admin reads all profiles" on profiles;
create policy "admin reads all profiles" on profiles
  for select using (public.is_admin());

-- =====================================================================
-- ROLLBACK — commented out; NOT part of this migration:
-- =====================================================================
-- drop policy if exists "admin reads all invites" on invites;
-- drop policy if exists "admin reads all orders" on orders;
-- drop policy if exists "admin reads all profiles" on profiles;
-- drop function if exists public.is_admin();
-- grant update on profiles to authenticated;
-- alter table profiles drop column if exists is_admin;
