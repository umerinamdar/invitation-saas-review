-- =====================================================================
-- NOT APPLIED — DO NOT RUN BLINDLY.
-- This migration is delivered as a file for owner review. The owner
-- applies it manually in Supabase → SQL Editor → New query → Run.
-- Prepared 2026-10-22 (Emergency release, Fix 6 — release audit
-- Agent B, finding D1).
-- =====================================================================
--
-- Why: migration 0001 created the invites policy
--   "own invites" ... for all using (auth.uid() = user_id)
--     with check (auth.uid() = user_id)
-- FOR ALL with an ownership-only check restricts WHOSE rows a
-- signed-in user may touch, but not WHICH COLUMNS. Any signed-in
-- customer can therefore use their own session token against
-- PostgREST directly and:
--   * PATCH their own draft invite with {"status":"published",
--     "published_at": <now>} — live at /i/<slug> with NO order and
--     NO payment; or
--   * INSERT a brand-new invite with "status":"published".
-- The paywall for the product's single paid action is currently
-- enforced in application code only. (The orders table in 0001 was
-- deliberately made owner-SELECT-only for exactly this reason —
-- "a customer cannot mark their own order paid". Invites never got
-- the equivalent guard.) This migration is that guard.
--
-- What it does: a BEFORE INSERT OR UPDATE trigger on public.invites.
-- For every caller EXCEPT service_role and JWT-less owner SQL
-- (an allowlist — any other role value is restricted):
--   * INSERT — the new row's status is forced to 'draft' and
--     published_at to NULL. Every other column is stored exactly as
--     sent (createInvite passes no status at all, so legitimate
--     inserts are unaffected apart from gaining the DB default
--     explicitly).
--   * UPDATE — any change to status or published_at (IS DISTINCT
--     FROM the old value) raises SQLSTATE 42501 with a plain
--     message. All other columns (config, theme_id, slug, title,
--     event_date, ...) stay freely editable by the owner, so the
--     editor's saveInvite flow ({config, theme_id, slug}) is
--     unaffected.
--
-- Who is NOT restricted, and why that is safe:
--   * service_role — the webhook's settle_and_publish (0004) and
--     the publishInvite helper run on the service role; publication
--     still works exactly as before. Their call paths were
--     re-read while preparing this migration: both write
--     status/published_at server-side only.
--   * Direct SQL by the project owner (SQL Editor / psql): those
--     sessions carry no Supabase JWT, so auth.role() is NULL and the
--     guard deliberately passes (coalesce). Owner data fixes and
--     manual incident handling stay possible.
--   * No application code path writes invite status or
--     published_at from the client (re-verified by grep while
--     preparing this migration: invites-api.ts inserts via
--     buildInviteInsert, which sets no status, and updates via
--     saveInvite's typed patch {config, theme_id, slug}).
--
-- Existing rows are untouched: already-published invites stay
-- published; the guard constrains future writes only.
--
-- DEPLOY ORDER: independent of application code and of migrations
-- 0003/0004/0005 — it may be applied at any time, and it MUST be
-- live before payments are enabled on the production project.
-- After applying, run the two new checks D9/D10 in
-- docs/RLS-VERIFICATION.sql (Block D).
--
-- PRE-FLIGHT (optional, informational): list the triggers already
-- on invites — expect only "invites_touch" (0001) before this runs:
--   select trigger_name from information_schema.triggers
--   where event_object_schema = 'public'
--     and event_object_table = 'invites';

create or replace function public.guard_invite_status()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_role text := coalesce(auth.role(), '');
begin
  -- Allowlist: ONLY service_role (server settlement) and JWT-less
  -- owner SQL (auth.role() is null, coalesced to '') pass through.
  -- Every other role value — 'anon', 'authenticated', or anything a
  -- future Supabase version adds — is treated as an end-user caller
  -- and restricted. (Impl round 2, Agent B finding B-2: was a
  -- two-value blocklist; behaviour is identical for every current
  -- caller, but a blocklist would silently pass an unknown role.)
  if v_role not in ('service_role', '') then
    if tg_op = 'INSERT' then
      new.status := 'draft';
      new.published_at := null;
    elsif tg_op = 'UPDATE' then
      if new.status is distinct from old.status
         or new.published_at is distinct from old.published_at then
        raise exception 'Invitation status is set by the server and cannot be changed directly.'
          using errcode = '42501';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists invites_status_guard on public.invites;
create trigger invites_status_guard
  before insert or update on public.invites
  for each row execute function public.guard_invite_status();

-- =====================================================================
-- ROLLBACK — commented out; NOT part of this migration. Dropping the
-- trigger re-opens the self-publish hole, so roll back only together
-- with a replacement guard:
-- =====================================================================
-- drop trigger if exists invites_status_guard on public.invites;
-- drop function if exists public.guard_invite_status();
