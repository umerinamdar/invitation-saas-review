-- =====================================================================
-- EasyInviteMaker — LIVE RLS VERIFICATION PACK
-- =====================================================================
-- Prepared 2026-10-22 (Round-2 Agent 5, master prompt §5.11 / §8.2).
--
-- WHAT THIS IS
-- Copy-ready SQL + REST checks for the OWNER to run against the LIVE
-- Supabase project. The app code delegates most browser-side ownership
-- enforcement to these policies (see findings-stageB-auth.md,
-- DB-2 — workspace evidence note, not shipped in this package). Unit
-- tests can pin what the code ASKS for; only this pack can
-- prove what the live database actually ENFORCES. No agent has ever
-- connected to the live database — everything below is run by you.
--
-- HOW TO RUN
-- Supabase Dashboard → your project → SQL Editor → New query.
-- Paste ONE block at a time, Run, and compare with the block's
-- EXPECTED / FAIL notes before moving on. Blocks A–C inspect the
-- catalog (what policies exist). Block D exercises the policies as
-- real users over REST, because the SQL Editor runs as a privileged
-- role that bypasses RLS and therefore cannot prove enforcement.
--
-- WHEN TO RUN
-- 1. BEFORE LAUNCH — this is a launch blocker (DB-2, layer 1).
-- 2. AGAIN AFTER APPLYING migration 0003
--    (supabase/migrations/0003_invite_media_hardening.sql): 0003
--    changes the invite-media bucket (public → private, size/MIME
--    limits) and replaces its read policies, so the Block B answers
--    legitimately CHANGE after 0003. The pack states both the
--    pre-0003 (0001) and post-0003 expected answers where they differ.
-- 3. After ANY future migration that touches policies.
-- 4. Steps D9/D10 (Block D) specifically AFTER applying migration
--    0006 (supabase/migrations/0006_invite_status_guard.sql): they
--    prove the invite status guard is live. Before 0006, D9
--    SUCCEEDS — that success is the paywall bypass 0006 exists to
--    close, so do not treat a pre-0006 D9 "pass" as healthy.
--
-- WHAT A FAIL MEANS, IN GENERAL
-- A FAIL here means the live database does not match the migrations
-- in this repo: either a migration was never applied, was applied
-- partially, or a policy was later edited by hand. Do not launch past
-- a FAIL. Re-applying the relevant migration file in the SQL Editor
-- is the usual fix (the migrations are written idempotently with
-- `drop policy if exists` guards).
-- =====================================================================


-- =====================================================================
-- BLOCK A — RLS is ENABLED on all six application tables
-- ---------------------------------------------------------------------
-- Proves: every table the app uses has row level security switched
-- on. RLS disabled on a table means every policy on it is ignored and
-- any signed-in user (and, for some grants, anonymous) can read/write
-- all rows through PostgREST.
--
-- EXPECTED: exactly 6 rows, every `rls_enabled` = true.
-- FAIL: any row with rls_enabled = false → that table is wide open.
--       Fewer than 6 rows → a table is missing entirely, i.e. its
--       migration was never applied (0001 creates the first five;
--       0002 creates webhook_deliveries).
-- =====================================================================
select
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'invites',
    'invite_assets',
    'orders',
    'invite_views',
    'webhook_deliveries'
  )
order by tablename;


-- =====================================================================
-- BLOCK B — invite-media storage bucket + its storage policies
-- ---------------------------------------------------------------------
-- B1 proves the bucket's visibility/limits. B2 lists the policies
-- that govern the bucket's objects.
--
-- B1 EXPECTED — two legitimate states, know which one you are in:
--   * 0001 only (0003 NOT yet applied): public = true,
--     file_size_limit = null, allowed_mime_types = null.
--     This is the KNOWN GAP S-1: draft media paths are fetchable by
--     anyone who learns them. Acceptable only as a pre-launch state.
--   * After 0003: public = false, file_size_limit = 10485760,
--     allowed_mime_types lists the 5 image + 5 audio types.
-- B1 FAIL: public = true AFTER you believed 0003 was applied →
--   0003 did not run (or its bucket UPDATE did not match).
--   No row at all → the bucket was never created (0001 not applied).
--
-- B2 EXPECTED:
--   * "owners write their media" — cmd ALL, roles {authenticated}
--     (from 0001; unchanged by 0003).
--   * Read policy, exactly one shape:
--       - pre-0003:  "invite media is readable" (SELECT, bucket-wide)
--       - post-0003: "owners read their media" (SELECT, authenticated)
--                    AND "media of published invites is readable"
--                    (SELECT)
-- B2 FAIL: "invite media is readable" still present after 0003 →
--   the read-all policy survived and draft media is still public.
--   Any policy whose qual/with_check does NOT mention invite-media
--   scoping on storage.objects → inspect it by hand before launch.
-- =====================================================================
-- B1
select
  id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'invite-media';

-- B2
select
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and (
    coalesce(qual, '') like '%invite-media%'
    or coalesce(with_check, '') like '%invite-media%'
  )
order by policyname;


-- =====================================================================
-- BLOCK C — full policy inventory (public schema + storage.objects)
-- ---------------------------------------------------------------------
-- Proves the policy SET matches the migrations — nothing missing,
-- nothing extra. Compare against the expected inventory in the
-- comment below; pg_policies shows one row per policy.
--
-- EXPECTED INVENTORY (0001 + 0002, with 0003 deltas marked):
--   profiles:        "own profile"                        ALL
--   invites:         "own invites"                        ALL
--                    "published invites are public"       SELECT
--   invite_assets:   "own invite assets"                  ALL
--                    "assets of published invites are
--                     public"                             SELECT
--   orders:          "read own orders"                    SELECT  ← the ONLY orders policy
--   invite_views:    "anyone may record a view"           INSERT
--                    "owners read their views"            SELECT
--   webhook_deliveries: NO ROWS AT ALL (RLS on, zero policies:
--                    only the service-role server code can touch it —
--                    that emptiness is correct and required)
--   storage.objects: as Block B2.
--
-- FAIL — any of these is a launch blocker:
--   * ANY INSERT, UPDATE or DELETE policy on orders → a browser user
--     could write orders (e.g. mark their own order "paid"). Orders
--     must be writable ONLY by the service-role server code, which
--     bypasses RLS by design.
--   * "own invites" missing → cross-user invite reads/writes depend
--     on the app code alone (the code backstop helps, but the policy
--     is the primary barrier — restore it).
--   * "published invites are public" missing → guests cannot open
--     shared invitation links.
--   * Any policy on webhook_deliveries → investigate who added it.
--   * Any policy not in the inventory above → read its qual /
--     with_check by hand; permissive policies COMBINE with OR, so an
--     extra loose policy silently widens every tight one beside it.
-- =====================================================================
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;


-- =====================================================================
-- BLOCK D — GUIDED TWO-USER LIVE TEST (REST, run in a terminal)
-- ---------------------------------------------------------------------
-- Blocks A–C prove the policies EXIST. This block proves they
-- ENFORCE, as two real users — the live twin of
-- src/test/authz-two-user.test.ts.
--
-- SETUP (once):
-- 1. Dashboard → Authentication → Users → Add user:
--      test-a@example.com  (note its UUID: <A_UUID>)
--      test-b@example.com  (note its UUID: <B_UUID>)
--    Give both a password you will use only for this test.
-- 2. Sign in as test-a in the app and create TWO invites:
--      one left as a DRAFT          → note its id <A_DRAFT_ID>
--                                     and slug <A_DRAFT_SLUG>
--      one PAID + PUBLISHED (test payment) → note its slug
--                                     <A_PUB_SLUG> and its order id
--                                     <A_ORDER_ID> (Dashboard →
--                                     Table editor → orders).
-- 3. In a terminal, set (values from Dashboard → Project Settings →
--    API; the publishable/anon key is safe to use here — it is the
--    same key the browser ships):
--      export SB="https://<PROJECT_REF>.supabase.co"
--      export ANON="<publishable-or-anon-key>"
-- 4. Get each user's access token (sign-in over REST):
--      curl -s -X POST "$SB/auth/v1/token?grant_type=password" \
--        -H "apikey: $ANON" -H "Content-Type: application/json" \
--        -d '{"email":"test-a@example.com","password":"<pw-a>"}'
--    Copy "access_token" from the response:  export TOK_A="<...>"
--    Repeat for test-b:                      export TOK_B="<...>"
--
-- Every call below sends BOTH headers:
--      -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B"
-- (swap $TOK_B for $TOK_A / omit Authorization as the step says).
--
-- ---- D1. B reads A's DRAFT invite -------------------------------
--   curl -s "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B"
--   EXPECTED: []            FAIL: A's draft row is returned.
--
-- ---- D2. B edits A's DRAFT invite -------------------------------
--   curl -s -X PATCH "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"theme_id":"pwned"}'
--   EXPECTED: [] (no row updated)
--   FAIL: the row comes back, or a follow-up D1-style read as A shows
--         theme_id changed.
--
-- ---- D3. B deletes A's DRAFT invite ------------------------------
--   curl -s -X DELETE "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B"
--   Then re-run D1 with $TOK_A.
--   EXPECTED: A's read still returns the draft.
--   FAIL: the draft is gone for A.
--
-- ---- D4. B reads A's orders --------------------------------------
--   curl -s "$SB/rest/v1/orders?user_id=eq.<A_UUID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B"
--   EXPECTED: []            FAIL: any of A's order rows.
--
-- ---- D5. B creates an order directly (bypassing the app) ---------
--   curl -s -X POST "$SB/rest/v1/orders" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B" -H "Content-Type: application/json" -d '{"user_id":"<B_UUID>","tier":"royal","amount_minor":59900,"currency":"INR","status":"paid"}'
--   EXPECTED: an error (401/403 — there is no INSERT policy).
--   FAIL: 201 Created. A browser-writable orders table means anyone
--         can mint a "paid" order; do not launch.
--
-- ---- D6. B flips A's order to paid --------------------------------
--   curl -s -X PATCH "$SB/rest/v1/orders?id=eq.<A_ORDER_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_B" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"status":"paid"}'
--   EXPECTED: [] (no row updated)
--   FAIL: the order returns with status "paid".
--
-- ---- D7. Anonymous reads ------------------------------------------
--   (No Authorization header at all — just the apikey.)
--   curl -s "$SB/rest/v1/invites?slug=eq.<A_DRAFT_SLUG>" -H "apikey: $ANON"
--   EXPECTED: []            FAIL: the draft is world-readable.
--   curl -s "$SB/rest/v1/invites?slug=eq.<A_PUB_SLUG>" -H "apikey: $ANON"
--   EXPECTED: exactly A's one published row.
--   FAIL: [] (guests would see a dead link — the "published invites
--         are public" policy is missing) or more than that one row.
--   curl -s "$SB/rest/v1/orders" -H "apikey: $ANON"
--   EXPECTED: []            FAIL: any order row.
--
-- ---- D8. Guest media access follows publication (storage) ---------
--   Use a media file A uploaded INTO THE DRAFT invite, at its real
--   path <A_UUID>/<A_DRAFT_ID>/<filename>:
--   curl -s -o /dev/null -w "%{http_code}\n" "$SB/storage/v1/object/invite-media/<A_UUID>/<A_DRAFT_ID>/<filename>" -H "apikey: $ANON"
--   EXPECTED:
--     * pre-0003:  200 — the KNOWN GAP S-1 (bucket still public).
--                  Record it; it is exactly what 0003 closes.
--     * post-0003: 400 or 404 for DRAFT media (guests locked out),
--                  and the same call against a PUBLISHED invite's
--                  media path returns 200 (guests keep working).
--   FAIL (post-0003): draft media returns 200, or published media
--         does not.
--
-- ---- D9. A flips their OWN draft invite to published ------------
--   (Added 2026-10-22, release Fix 6. Migration 0001's "own invites"
--   policy is ownership-only with no column restriction, so WITHOUT
--   migration 0006 this call SUCCEEDS — any signed-in customer can
--   publish their own invite with no payment. 0006 adds a trigger
--   that makes it fail. Run this check only AFTER applying 0006;
--   a success here after 0006 means the guard is not live: FAIL.)
--   curl -s -X PATCH "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"status":"published","published_at":"2026-10-22T00:00:00Z"}'
--   EXPECTED (after 0006): an error (42501 / non-2xx), and a
--         follow-up D1-style read as A still shows status "draft".
--   FAIL: the row comes back with status "published" — the invite
--         is live at /i/<slug> without any payment. Do not enable
--         payments while this fails.
--
-- ---- D10. A inserts a NEW invite already marked published -------
--   (Same migration, INSERT side. 0006 coerces an end-user insert
--   to status "draft" with published_at NULL, so this may return
--   201 — what matters is the STORED status. Note the new row's id
--   from the response for the follow-up read and the cleanup.)
--   curl -s -X POST "$SB/rest/v1/invites" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"user_id":"<A_UUID>","slug":"rls-check-published-insert","theme_id":"dubai-silk","status":"published","published_at":"2026-10-22T00:00:00Z"}'
--   Then read the stored row back:
--   curl -s "$SB/rest/v1/invites?slug=eq.rls-check-published-insert&select=id,status,published_at" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A"
--   EXPECTED (after 0006): either the INSERT errored, or the stored
--         row shows status "draft" and published_at null.
--   FAIL: a stored row with status "published". Delete the test row
--         either way (D3-style DELETE as A).
--
-- ---- D11. A changes ONLY published_at on their own draft --------
--   (Added 2026-10-22, impl round 2. D9 changes status and
--   published_at together; the 0006 guard is change-based
--   (IS DISTINCT FROM), so a published_at-only change must ALSO
--   raise. Run after 0006.)
--   curl -s -X PATCH "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"published_at":"2026-10-22T00:00:00Z"}'
--   EXPECTED (after 0006): an error (42501 / non-2xx); follow-up
--         read as A still shows published_at null.
--   FAIL: the row comes back with published_at set.
--
-- ---- D12. A upserts an invite with published status --------------
--   (Impl round 2. PostgREST upsert = INSERT ... ON CONFLICT DO
--   UPDATE; both halves fire the 0006 trigger, so neither half may
--   produce a published row. Run after 0006. Uses the draft's id as
--   the conflict target.)
--   curl -s -X POST "$SB/rest/v1/invites?on_conflict=id" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: resolution=merge-duplicates,return=representation" -d '{"id":"<A_DRAFT_ID>","user_id":"<A_UUID>","slug":"<A_DRAFT_SLUG>","theme_id":"dubai-silk","status":"published","published_at":"2026-10-22T00:00:00Z"}'
--   EXPECTED (after 0006): an error (42501 / non-2xx), and a
--         follow-up read as A still shows the draft unchanged
--         (status "draft", published_at null, original theme_id).
--   FAIL: the row comes back published, or the draft was mutated.
--
-- ---- D13. A's ordinary edits still work; ownership cannot move ---
--   (Impl round 2 — the PASS side of the guard. The 0006 trigger is
--   change-based, so legitimate owner edits must NOT be blocked, and
--   the RLS WITH CHECK must stop an owner reassigning their row.)
--   (a) Ordinary edit:
--   curl -s -X PATCH "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"theme_id":"madina"}'
--   EXPECTED: the row returns with theme_id "madina" (edit allowed).
--   FAIL: an error — the guard is over-broad and breaks the editor.
--   (Restore theme_id afterwards with the same call.)
--   (b) Ownership reassignment:
--   curl -s -X PATCH "$SB/rest/v1/invites?id=eq.<A_DRAFT_ID>" -H "apikey: $ANON" -H "Authorization: Bearer $TOK_A" -H "Content-Type: application/json" -H "Prefer: return=representation" -d '{"user_id":"<B_UUID>"}'
--   EXPECTED: an error (RLS WITH CHECK) or [] — the row stays A's.
--   FAIL: the row returns with user_id = <B_UUID>.
--
-- CLEANUP: delete test-a / test-b from Authentication → Users after
-- the run, and delete their test invites/orders (including the
-- D10 test row).
-- =====================================================================
