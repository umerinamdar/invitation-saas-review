# Muse task brief — read-only admin dashboard (v1)

**Date:** 2026-10-24 · **Repo:** `umerinamdar/invitation-saas-review` · **Base:** `main` (currently `0850be8`)
**Branch to create:** `muse-admin-dashboard-2026-10-24` off `main`. Never push to `main` directly — open a PR when done.

## Context

EasyInviteMaker has **no admin/owner role today**. Every table's RLS policy is a plain `auth.uid() = user_id` ownership check — the site owner has zero special access in-app, only external options (direct SQL via the Supabase dashboard, or the payment gateway's own admin panel). The owner wants to see, from inside the app: total orders, revenue, and a list of invitations/orders — nothing more for v1.

**This task is security-sensitive — read every section below before writing code, not just the task list.** The single most important property of this feature: **a regular signed-up user must never be able to make themselves an admin, see another user's data by guessing a URL, or have the admin check bypassed client-side.** If anything in this brief seems to leave a gap in that guarantee, stop and flag it rather than shipping a workaround.

## Scope for v1 — read-only visibility ONLY

**In scope:** one admin account (the owner) can see, in-app: total revenue, order counts by status, a list of recent orders, a list of recent invitations across all users.

**Explicitly OUT of scope — do not build these:** editing or deleting another user's invite, changing an order's status, issuing refunds in-app, an admin UI for managing other admins, pagination/search/filtering beyond a simple recent-N list. All of that is deliberately deferred to a later round. Keep this v1 small and reviewable.

## 1. Migration `supabase/migrations/0007_admin_role.sql`

Follow the exact style of the existing migrations (`0001_init.sql` for policy syntax, `0006_invite_status_guard.sql` for the comment/structure conventions and its "run this verification after" pattern).

1. **Add the column:**
   ```sql
   alter table profiles add column if not exists is_admin boolean not null default false;
   ```

2. **Lock the column down with column-level privileges — this is the part that must be exactly right.** RLS's `with check` on the existing `"own profile"` policy (`auth.uid() = id`) means a signed-in user CAN update their own profile row — including, unless blocked, the `is_admin` column itself. Block it at the privilege level, not with a trigger (simpler, and Postgres enforces it before RLS even runs):
   ```sql
   revoke update on profiles from authenticated;
   grant update (full_name, phone) on profiles to authenticated;
   ```
   Verify after applying: as an authenticated test user, attempt `update profiles set is_admin = true where id = auth.uid();` — this MUST fail with a permission-denied error, not silently no-op. Add this exact check to the verification pack (see §3).

3. **Add a reusable admin-check function:**
   ```sql
   create or replace function public.is_admin()
   returns boolean
   language sql
   security definer
   set search_path = public
   stable
   as $$
     select coalesce((select is_admin from profiles where id = auth.uid()), false);
   $$;
   ```
   This only ever returns a boolean and performs no writes, so the default `EXECUTE` grant to `authenticated`/`anon` is fine — do NOT copy migration 0004's `revoke execute` pattern here, that was for a privileged write function, not this.

4. **Add admin-read (SELECT-only) policies** — additive, they OR with the existing owner policies, nothing existing changes:
   ```sql
   create policy "admin reads all invites" on invites
     for select using (public.is_admin());
   create policy "admin reads all orders" on orders
     for select using (public.is_admin());
   create policy "admin reads all profiles" on profiles
     for select using (public.is_admin());
   ```

5. **Do NOT hardcode the owner's email or user id anywhere in this migration file or anywhere in the repo.** The migration only adds the column/function/policies. Flipping the owner's own row to `is_admin = true` is a manual, one-time SQL statement the owner runs themselves in the Supabase SQL Editor AFTER applying this migration — write that exact instruction (`update profiles set is_admin = true where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');`) into the migration file's header comment as a note for the owner to run manually, not as executable SQL in the file itself.

## 2. Verification pack — `docs/ops/VERIFY-0007.sql` (mirror `docs/VERIFY-0004.sql`'s structure)

Must include, each as a labelled block with expected result noted:
- **V1:** `is_admin` column exists on `profiles`, type boolean, default `false`.
- **V2:** column privilege check — confirm `authenticated` role's grantable/updatable columns on `profiles` do NOT include `is_admin` (query `information_schema.column_privileges`).
- **V3:** live behavioural check (run as an authenticated test user, not the SQL Editor's superuser context) — attempting to set `is_admin = true` on your own row fails.
- **V4:** with one user flagged `is_admin = true` and one not, confirm the non-admin still sees only their own rows in `invites`/`orders` (unchanged from today), and the admin sees rows belonging to both. This is a manual two-account REST check, same shape as the existing `docs/RLS-VERIFICATION.sql` Block D.

## 3. Client-side

### `src/lib/admin-api.ts` (new file, follow the wrapper-function pattern in `src/lib/invites-api.ts`/`src/lib/orders-api.ts`)

- `isCurrentUserAdmin(): Promise<boolean>` — reads the signed-in user's own `profiles.is_admin` (works today via the existing `"own profile"` policy, no RLS change needed for this one call).
- `getAdminOverview(): Promise<{ totalRevenuePaise: number; ordersByStatus: Record<string, number>; totalInvites: number; totalUsers: number }>` — aggregate queries against `orders`, `invites`, `profiles`. These only return data because of the new admin-read policies; if called by a non-admin they'll just get their own rows back (safe, not an error — RLS does the filtering).
- `listRecentOrders(limit = 50)` and `listRecentInvites(limit = 50)` — simple ordered-by-`created_at`-desc lists, no pagination needed for v1.

### `src/routes/admin.tsx` (new route)

Follow `src/routes/dashboard.tsx`'s structure (same auth-gate pattern, same `SiteHeader`/`SiteFooter` shell):
- `head()`: title `"Admin — ${BRAND}"`, `{ name: "robots", content: "noindex" }` (never indexed, same as dashboard).
- If `!loading && !session`: redirect to `/login`, exactly like dashboard.tsx.
- If signed in but `isCurrentUserAdmin()` resolves `false`: redirect to `/dashboard` silently — do not render any "you're not an admin" message that confirms the route's purpose to a curious regular user.
- If admin: render the overview (revenue in ₹, order counts by status) and the two recent-rows tables (orders, invites). Keep the UI simple — plain tables, reuse existing `.btn`/table-ish styles already in `site.css` rather than inventing new components. No new animation/motion work needed here.
- Do NOT add an "Admin" link to the main site nav (`SiteHeader`) for this v1 — it's reached by direct URL only, same as how `/create` isn't in every nav context either. (A nav-link-only-when-admin nicety can be a fast-follow, not required now.)

## 4. Tests

### `src/test/admin-authz.test.ts` (new — mirror the fake-Supabase-client pattern in `src/test/authz-two-user.test.ts` exactly, same style of comments explaining what the fake does and does not prove)

Three fixture users: `user-a` (`is_admin: false`), `user-b` (`is_admin: false`), `admin-owner` (`is_admin: true`). Cover:
- `isCurrentUserAdmin()` returns `false` for user-a/user-b, `true` for admin-owner.
- The fake's admin-read policy leg: admin-owner's `listRecentOrders`/`listRecentInvites` returns rows from BOTH user-a and user-b. user-a's own calls still return only user-a's rows (unchanged — prove the existing owner-only behavior is not weakened by the new policy).
- As in `authz-two-user.test.ts`, be explicit in comments about what this unit test proves (the code's query shape + the modeled policy outcome) versus what only the live SQL verification pack (§2) can prove (what the real database actually enforces).

### `src/test/admin-route.test.tsx` (new, or add to an existing route-guard test file if one fits better)

- No session → renders nothing / redirects toward `/login`.
- Session, `isCurrentUserAdmin()` resolves `false` → redirects toward `/dashboard`.
- Session, `isCurrentUserAdmin()` resolves `true` → renders the overview content.

## Rules (standing, same as prior batches)

- Branch-only work off `main`. Never push to `main` directly. No force pushes, no history rewrites (Lovable-connected repo).
- No payment-code changes beyond what's described here, no changes to `.env`, no secrets in code or chat, never commit the owner's actual email/user id anywhere.
- Before pushing: `npx vitest run` must stay green, `npx tsc --noEmit` must be 0 errors, `npm run build` must stay green, `npx eslint .` must not introduce new errors beyond the current baseline (compare touched files before/after like prior verification reports did).
- Open a PR against `main` when done, with the gate numbers AND an explicit statement confirming V1–V4 from §2 were reasoned through (the live SQL checks themselves are the owner's to run against the production database — Muse cannot reach it — but the PR description must say exactly what the owner needs to run and what result proves it's safe, same shape as `docs/ops/RELEASE-CHECKLIST.md`'s existing TODO(owner) items).
- **Do not relax, remove, or rewrite any existing RLS policy while doing this** — every change here is additive (new column, new function, new SELECT-only policies). If finishing this task seems to require touching an existing policy, stop and say so instead of doing it.

## What happens after this PR

The owner will: apply migration 0007 to the live database, run the verification pack, then run the one manual SQL statement to flag their own account as admin (never committed anywhere). Only after that does `/admin` do anything for them — until then it correctly just bounces them to `/dashboard` like any other non-admin account.
