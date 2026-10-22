-- =====================================================================
-- NOT APPLIED — DO NOT RUN BLINDLY.
-- This migration is delivered as a file for owner review. The owner
-- applies it manually in Supabase → SQL Editor → New query → Run,
-- after 0001_init.sql and 0002_webhook_deliveries.sql.
-- Prepared 2026-10-21 (security finding S-1).
-- =====================================================================
--
-- Revision (2026-10-21, Task 2 review): the draft's orders_invite_idx
-- was removed — no live query filters orders by invite_id (its only
-- justifying function, hasInvitePaidOrder, has zero callers in src/).
-- If that query pattern is ever wired in, a composite
-- (invite_id, status) index is the right shape, added by that task.
--
-- Why: in 0001 the `invite-media` bucket is created public = true with
-- a read-all storage policy and no file_size_limit / allowed_mime_types,
-- so once uploads are wired to it, any unpublished (draft) couple photo
-- or audio file would be fetchable by anyone who learns its path, and
-- uploads of any size or type would be accepted.
--
-- Why private is safe here: nothing in the application references
-- public bucket URLs — a grep of src/ and public/ for "invite-media",
-- storage.from(...), getPublicUrl and /storage/v1/object/public finds
-- zero uses (uploads are still browser-only object URLs; no Storage
-- code exists yet). Access after this migration follows the same
-- owner / published pattern as the invite_assets table policies in
-- 0001: owners read their own media; media of *published* invites
-- stays readable so guest pages keep working when uploads are wired;
-- drafts become private.
--
-- Paths are <user_id>/<invite_id>/<filename> (see 0001), so segment 1
-- is the owner and segment 2 is the invite.

-- Bucket: private, 10 MB cap, image/audio types only ------------------
-- The 10 MB cap matches the app's client-side limits (photos ≤ 8 MB,
-- music ≤ 10 MB in the editor).
update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
      'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/x-wav', 'audio/ogg'
    ]
where id = 'invite-media';

-- Read policies: replace the read-all policy from 0001 ------------------
drop policy if exists "invite media is readable" on storage.objects;

drop policy if exists "owners read their media" on storage.objects;
create policy "owners read their media" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'invite-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media of published invites is readable" on storage.objects;
create policy "media of published invites is readable" on storage.objects
  for select using (
    bucket_id = 'invite-media'
    and exists (
      select 1 from invites i
      where i.id::text = (storage.foldername(name))[2]
        and i.status = 'published'
    )
  );

-- The owner-scoped write policy from 0001 ("owners write their media")
-- is unchanged and still applies.

-- No index is added by this migration: invites are looked up by id
-- (PK), slug (unique + partial published index in 0001) and
-- preview_token (unique); orders by id (PK) and user_id
-- (orders_user_idx in 0001); webhook_deliveries by delivery_id
-- (unique + index in 0002); invite_assets by invite_id (index in
-- 0001).

-- =====================================================================
-- ROLLBACK — commented out; NOT part of this migration. To reverse
-- this migration after applying it, run the statements below
-- (uncommented) in the SQL Editor. They restore the exact 0001 state:
-- the two new read policies are dropped, the read-all policy is
-- recreated under its exact 0001 name, and the bucket returns to
-- public with no size limit or MIME allowlist (the 0001 defaults).
-- =====================================================================
-- drop policy if exists "owners read their media" on storage.objects;
-- drop policy if exists "media of published invites is readable" on storage.objects;
-- create policy "invite media is readable" on storage.objects
--   for select using (bucket_id = 'invite-media');
-- update storage.buckets
-- set public = true,
--     file_size_limit = null,
--     allowed_mime_types = null
-- where id = 'invite-media';
-- drop index if exists orders_invite_idx; -- only relevant if the
-- pre-review draft of this file (which added that index) was applied;
-- the reviewed version above does not create it.
