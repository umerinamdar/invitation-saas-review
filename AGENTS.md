<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the invitation experience on the index route with isolated scratch-canvas and cinematic-playback components so interactions stay independent.
- Keep event instant and venue destination in a shared invitation module with concrete tests; the countdown uses an explicit timezone rather than each guest's local clock.
- Custom audio is session-only browser playback; do not upload guests' chosen tracks to a service without an explicit persistence request.
- Mount invitation details only after envelope opening; use an inline, single-clock cinematic introduction that completes into the scrollable page, not a second modal opening, so the guest follows one uninterrupted experience.
- Prime browser audio muted on the opening gesture and unmute only after envelope opening; this preserves browser playback permission without audible music before the reveal.
- Play the seal accent through a separate browser audio element so it cannot restart or interrupt the gesture-primed invitation music.
- Keep the date/time scratch canvas separate from portrait artwork and remove it after reveal so native scrolling resumes immediately.
- Keep the scratch surface keyboard-activatable without a separate visible reveal button so the minimal design remains accessible.
- Calculate date-only relationship milestones as completed calendar years, months and remaining days in the shared invitation module, using the event timezone; avoid decimal-year approximations or implying a known meeting hour.
