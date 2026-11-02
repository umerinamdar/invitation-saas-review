# Where seo-ops state actually lives

These files are NOT in the EasyInviteMaker git repo. There is no `seo-ops/`
directory on main, and no `docs/ops/muse-seo-runbook.md` in the repo either
(checked 2026-11-02, main @ ff4d7da9).

They live in Muse's workspace, under this goal:

  ~/workspace/goals/easyinvitemaker-seo-batch/seo-ops/
    state/known-findings.json
    state/task-backlog.json
    state/last-run.json
    reports/2026-11-02.md       (run #1)
    reports/2026-11-02-run2.md  (run #2)

That workspace persists across Muse sessions, so the next runbook run can
read them — but they are NOT shared with GitHub, Claude Code, or anyone
looking only at the repo. If a shared, versioned record is wanted, the
state files would need to be committed to the repo (e.g. under
`docs/ops/seo-ops/`) via a PR on each run — that was NOT done in run #1
or run #2, and needs an explicit owner choice of location before it happens.

## Standing decision (2026-11-02)

Future state commits go to GitHub branch `seo-ops-state` in
`umerinamdar/invitation-saas-review`. That branch did not exist yet at
14:41 Dubai on 2026-11-02 — it is to be created at the next state commit
(run #3 or an explicit commit instruction), not by the relay step alone.
Run #3 is deferred until GSC Performance data accumulates, and must
check that report (or use owner-supplied numbers).
