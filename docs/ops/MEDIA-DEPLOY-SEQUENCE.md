# Guest Media — Private-Bucket Deployment Sequence (migration 0003)

**Status: owner-side live steps. Nothing here has been run against the
live project.** This document is the safe order for making the
`invite-media` bucket private without breaking published invitations,
plus how to tell — from server logs — if something went wrong.

## How guest media resolves (one paragraph)

A published invitation's config can reference media four ways, and only
one is a Supabase Storage object: **storage paths** (the only kind ever
signed), **external URLs** (passed through untouched), **session URLs**
(`blob:`/`data:` — editor previews only, never on a guest page), and
**app assets** (demo/theme files shipped with the site). For a published
invite, the `/i/<slug>` loader asks a server function
(`src/lib/media-signing.ts`) to mint 1-hour signed URLs for exactly that
invite's own storage paths — the paths are derived from the invite row
server-side, never supplied by the client, and draft-scoped or
other-invite paths are excluded. The page renders signed URLs where
minted and falls back per path to the plain public URL. That fallback
is what makes the sequence below safe in this order — and meaningless
in the reverse order.

## The sequence (do not reorder)

1. **Deploy the application code first** — the build containing the
   signed-URL flow (`media-url.ts` / `media-signing.ts`, present since
   Round 2) and the signing diagnostics (Round 3). Confirm the
   deployment's server environment has `SUPABASE_SERVICE_ROLE_KEY`
   set; the startup log line names missing variables.
2. **Verify BEFORE 0003:** open a real published invitation as a
   guest (logged out, ideally on a phone) and confirm gallery photos,
   the song and the seal image all load. At this stage both signed
   URLs and public URLs work, because the bucket is still public.
3. **Apply migration 0003** (`supabase/migrations/0003_invite_media_hardening.sql`)
   in the Supabase SQL Editor. The bucket becomes private; public URLs
   stop serving objects.
4. **Re-verify the SAME published invitation** as a guest: gallery,
   song and seal must still load — now exclusively via signed URLs.
   Then check the server logs for the diagnostic line
   `Signed URL minting incomplete for published invite media`
   (fields: `inviteId`, `failedCount`, `failedFiles`). **Any hit means
   that invite's guests are seeing broken media** — see "When the
   diagnostic fires" below.
5. **Confirm a draft stays private:** a draft invitation's media must
   NOT be reachable by a guest — draft paths are never signed, there
   is no public guest route to a draft, and post-0003 the public URL
   for a draft object is dead. The owner's own editor/preview keeps
   working under the owner storage policies.

**Never apply 0003 before step 1.** With the bucket private and no
signed-URL code deployed, every published invitation's stored photos,
song and seal break at once, and (before Round 3) nothing would have
appeared in the logs to say why.

## When the diagnostic fires

`Signed URL minting incomplete for published invite media` means the
server asked Supabase Storage to sign some of a published invite's
paths and got fewer back than requested. After 0003, each listed file
is broken for guests until this is fixed. Likely causes, in order:

1. `SUPABASE_SERVICE_ROLE_KEY` missing/wrong in the deployment
   environment (signing uses the service-role client).
2. The object genuinely missing from the bucket (deleted, or a config
   saved with a path that was never copied at publish — draft media is
   copied into the invite's folder by `copyDraftMediaToInvite`; a
   failed copy blocks the publish, so a published config should never
   point at the draft folder).
3. Supabase Storage outage/degradation — retry by reloading the guest
   page; if the line keeps firing with the same `failedFiles`, it is
   not transient.

The diagnostic deliberately logs file names only — no signed URLs
(they carry access tokens) and no full storage paths (their first
segment is the owner's user id). It fires once per guest-page load
that comes back short, never on success, and never for invites with
no stored media.

## What remains unverified until the owner runs this

- The live post-0003 guest check itself (steps 4–5) — no live
  database or deployment was touched while writing this.
- True behaviour under the real bucket policies is only provable
  against the live project; the unit/integration tests pin the code
  paths (signing set, path filtering, fallback, diagnostics) with
  mocked storage.
