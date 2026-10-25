import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Infinity as InfinityIcon,
  LoaderCircle,
  MapPin,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScratchInvitation } from "@/components/scratch-invitation";
import { CinematicInvite } from "@/components/cinematic-invite";
import { RevealStage } from "@/components/reveals";
import { ConfettiBurst } from "@/components/confetti-burst";
import { OrnateFrame, PatternBackdrop } from "@/components/ornament";
import {
  eventDayRelation,
  hasValidEventDate,
  hasValidTogetherDate,
  musicFadeVolume,
  remainingTime,
  safeExternalUrl,
  togetherDuration,
  togetherElapsed,
  venueMapsHref,
} from "@/lib/invitation";
import { openingDurationMs } from "@/lib/motion";
import { paletteVariables, type Theme } from "@/themes/types";
import { resolveWithMediaUrlMap, type MediaUrlMap } from "@/lib/media-url";
import { supabase } from "@/lib/supabase";
import {
  galleryImage,
  hasFamily,
  hostNames,
  type Family,
  type Invite,
} from "@/invites/types";

const SEAL_CLICK = "/audio/seal-click.wav";

/** "1 Day", "3 Days" — the milestone counters read "1 Days" without this. */
function pluralLabel(value: number | undefined, label: string) {
  return value === 1 ? label.slice(0, -1) : label;
}

/**
 * Parents and grandparents under the couple's names, as Indian invitations
 * do — the name itself isn't repeated here since it's already the big
 * heading directly above; this block only adds the lineage under it.
 */
function FamilyLines({
  name,
  family,
}: {
  name: string | undefined;
  family: Family | undefined;
}) {
  if (!name || !hasFamily(family)) return null;
  return (
    <div className="family-block">
      {family?.credentials && (
        <p className="family-credentials">{family.credentials}</p>
      )}
      {family?.parents && (
        <p>
          {family.relation ?? "Child of"} {family.parents}
        </p>
      )}
      {family?.grandparents && (
        <p className="family-grandparents">
          Grandchild of {family.grandparents}
        </p>
      )}
    </div>
  );
}

/**
 * The invite engine. Everything it draws comes from `theme` (how it looks)
 * and `invite` (whose event it is) — it holds no event details of its own.
 */
export function Invitation({
  theme,
  invite,
  mediaUrlMap,
  watermark,
}: {
  theme: Theme;
  invite: Invite;
  /**
   * Gap-B: server-minted signed URLs for a published invite's own
   * media (see lib/media-url.ts). Only the public /i/<slug> route
   * supplies one; editor and preview renders omit it and resolve
   * media exactly as before.
   */
  mediaUrlMap?: MediaUrlMap;
  /**
   * Shows a non-interactive overlay marking the render as a pre-purchase
   * preview, so theme designs aren't trivially screenshotted/reused from
   * free browsing. Never set on the published guest page (/i/$slug) —
   * a paying customer's own invitation renders clean.
   */
  watermark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [artState, setArtState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [slowLoad, setSlowLoad] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [time, setTime] = useState<number[] | null>(null);
  const [duration, setDuration] = useState<[number, number, number] | null>(
    null,
  );
  const [elapsed, setElapsed] = useState<[number, number, number] | null>(null);
  const [music, setMusic] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [flowers, setFlowers] = useState(false);
  // Poppers fire first; the petals start as they settle.
  const [popped, setPopped] = useState(false);
  // The music/restart dock is icon-only; a touch device has no hover to
  // reveal what each icon does, so show the labels once on open and fade
  // them rather than relying on a `title` tooltip that never fires on touch.
  const [showDockHint, setShowDockHint] = useState(true);
  const audio = useRef<HTMLAudioElement>(null);
  const sealAudio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fade = useRef(0);
  const primedPlayback = useRef<Promise<void> | null>(null);
  const opened = useRef(false);
  const completeIntro = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setShowDockHint(false), 4000);
    return () => clearTimeout(id);
  }, [open]);

  const { sealedBackdrop, revealedBackdrop, defaultMusic } = theme.assets;
  const { ornamentation } = theme;
  // Doors, curtains, books and boxes animate the painting itself rather
  // than CSS panels drawn over it, so the mechanic itself fills the stage
  // edge to edge; a separate full-bleed copy behind it would show the same
  // photo at a different crop and seam visibly at the mechanic's edges.
  const paintedOpening = (r: string) => r !== "envelope";
  const { reveal, openMs, introSeconds, musicFadeMs, maxVolume, petals } =
    theme.motion;
  const { event, story } = invite;
  // No date (or an unparseable one) means no scratch-to-reveal and no
  // countdown: there is nothing to reveal or count to, and the
  // countdown maths would render "NaN". Editor drafts start undated.
  const eventDateValid = hasValidEventDate(event.startIso);
  // Once the event day itself has passed, a wall of zeroes under the
  // venue is a countdown to nothing — the block hides and the date
  // above stays on display. On the day itself it keeps counting to the
  // ceremony time. (Recomputed each render; the one-second clock below
  // keeps it current across midnight.)
  const eventDay = eventDayRelation(Date.now(), event.startIso);
  const musicUrl = resolveWithMediaUrlMap(
    invite.music?.url ?? defaultMusic,
    mediaUrlMap,
    supabase,
  );
  const hasMusic = Boolean(musicUrl);
  const names = hostNames(invite);
  const ring = galleryImage(invite, "ring");
  const childhood = galleryImage(invite, "childhood");
  const forever = galleryImage(invite, "forever");
  const ringUrl = ring
    ? resolveWithMediaUrlMap(ring.url, mediaUrlMap, supabase)
    : undefined;
  const childhoodUrl = childhood
    ? resolveWithMediaUrlMap(childhood.url, mediaUrlMap, supabase)
    : undefined;
  const foreverUrl = forever
    ? resolveWithMediaUrlMap(forever.url, mediaUrlMap, supabase)
    : undefined;
  const sinceIso = story?.togetherSinceIso;

  useEffect(() => {
    let cancelled = false;
    setSlowLoad(false);
    const sources = [
      sealedBackdrop,
      revealedBackdrop,
      ringUrl,
      childhoodUrl,
    ].filter(Boolean) as string[];
    // Most guests are on fast connections; this is just a cue that the
    // wait is still "loading", not "stuck", before the 12s hard deadline.
    const slowNotice = setTimeout(() => {
      if (!cancelled) setSlowLoad(true);
    }, 5000);
    const deadline = setTimeout(() => {
      if (!cancelled) setArtState("error");
    }, 12000);
    Promise.all(
      sources.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Artwork unavailable"));
            image.src = src;
          }),
      ),
    )
      .then(() => {
        if (!cancelled) {
          clearTimeout(slowNotice);
          clearTimeout(deadline);
          setArtState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(slowNotice);
          clearTimeout(deadline);
          setArtState("error");
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(slowNotice);
      clearTimeout(deadline);
    };
  }, [attempt, sealedBackdrop, revealedBackdrop, ringUrl, childhoodUrl]);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      setTime(remainingTime(now, event.startIso));
      if (hasValidTogetherDate(sinceIso, now)) {
        setDuration(togetherDuration(now, sinceIso));
        setElapsed(togetherElapsed(now, sinceIso));
      }
    };
    update();
    const id = setInterval(update, 1000);
    return () => {
      clearInterval(id);
      if (timer.current) clearTimeout(timer.current);
      if (musicDelay.current) clearTimeout(musicDelay.current);
      cancelAnimationFrame(fade.current);
    };
  }, [event.startIso, sinceIso]);

  async function startMusic() {
    const player = audio.current;
    if (!player) return;
    cancelAnimationFrame(fade.current);
    player.volume = 0;
    try {
      // Reuse gesture-primed playback instead of issuing a second play at the reveal.
      if (primedPlayback.current) {
        const primed = primedPlayback.current;
        primedPlayback.current = null;
        await primed;
      }
      if (player.paused) await player.play();
      // Begin the song from its very start so the entrance feels intentional.
      player.currentTime = 0;
      player.muted = false;
      setMusic(true);
      setAudioError("");
      let elapsedMs = 0;
      let previous = performance.now();
      const swell = (now: number) => {
        if (player.paused) return;
        // A buffering gap must not turn into a sudden volume jump on resume.
        if (player.readyState >= 3) elapsedMs += Math.min(now - previous, 100);
        previous = now;
        player.volume = musicFadeVolume(elapsedMs, musicFadeMs, maxVolume);
        if (elapsedMs < musicFadeMs)
          fade.current = requestAnimationFrame(swell);
      };
      fade.current = requestAnimationFrame(swell);
    } catch {
      setMusic(false);
      setAudioError("Music couldn’t play.");
    }
  }

  function openEnvelope() {
    if (opening || open) return;
    setOpening(true);
    // A separate, short tactile accent never interrupts the silently primed song.
    const click = sealAudio.current;
    if (click) {
      click.volume = 0.4;
      void click.play().catch(() => {});
    }
    // Prime silently during the guest's gesture; no music is audible until the flap opens.
    const player = audio.current;
    if (player) {
      player.muted = true;
      player.volume = 0;
      primedPlayback.current = player.play();
      // Observe failure now; startMusic retains the original promise and reports it after opening.
      void primedPlayback.current.catch(() => {});
    }
    timer.current = setTimeout(
      () => {
        opened.current = true;
        setOpen(true);
        setOpening(false);
        musicDelay.current = setTimeout(startMusic, 1000);
      },
      // Reduced-motion guests: the CSS collapses the opening to an
      // instant change for them, so the timer must not keep them
      // waiting on a sealed cover for the full openMs either.
      openingDurationMs(openMs),
    );
  }

  function toggleMusic() {
    if (music) {
      cancelAnimationFrame(fade.current);
      audio.current?.pause();
      setMusic(false);
    } else startMusic();
  }

  return (
    <main
      className="new-invitation"
      data-theme-id={theme.id}
      style={paletteVariables(theme) as React.CSSProperties}
    >
      {watermark && (
        <div className="preview-watermark" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i}>easyinvitemaker.com</span>
          ))}
        </div>
      )}
      <audio
        ref={sealAudio}
        src={SEAL_CLICK}
        preload="auto"
        aria-hidden="true"
      />
      {hasMusic && (
        <audio
          ref={audio}
          src={musicUrl}
          loop
          preload="auto"
          onError={() => {
            setMusic(false);
            if (opened.current) setAudioError("Music couldn’t load.");
          }}
        />
      )}
      {!open ? (
        <section
          className={`sealed-stage ${opening ? "opening-stage" : ""} ${
            sealedBackdrop && paintedOpening(reveal) ? "painted-stage" : ""
          }`}
        >
          {sealedBackdrop && !paintedOpening(reveal) ? (
            <img
              src={sealedBackdrop}
              className="sealed-backdrop"
              alt=""
              width={1536}
              height={1024}
              fetchPriority="high"
            />
          ) : !sealedBackdrop ? (
            <PatternBackdrop kind={ornamentation} />
          ) : null}
          <OrnateFrame kind={ornamentation} />
          <RevealStage
            reveal={reveal}
            label={event.typeLabel}
            hosts={names}
            {...(sealedBackdrop && paintedOpening(reveal)
              ? { backdrop: sealedBackdrop }
              : {})}
            opening={opening}
            onOpen={openEnvelope}
          />
        </section>
      ) : (
        <div className="opened-invitation">
          <section className="skyline-invitation">
            {revealedBackdrop ? (
              <>
                <img
                  src={revealedBackdrop}
                  className="skyline-backdrop"
                  width={1536}
                  height={1024}
                  alt=""
                  fetchPriority="high"
                />
                <div className="skyline-veil" />
              </>
            ) : (
              <PatternBackdrop kind={ornamentation} />
            )}
            <OrnateFrame kind={ornamentation} />
            <CinematicInvite
              running={artState === "ready" && !introDone}
              seconds={introSeconds}
              onComplete={completeIntro}
            />
            {invite.blessing?.text && (
              <div className="invitation-blessing">
                <p>{invite.blessing.text}</p>
                {invite.blessing.attribution && (
                  <cite>{invite.blessing.attribution}</cite>
                )}
              </div>
            )}
            <div className="invitation-heading">
              <p>{event.typeLabel}</p>
              <span className="heading-rule" />
            </div>
            {invite.welcome && (
              <p className="invitation-welcome">{invite.welcome}</p>
            )}
            <div className="invitation-names">
              <h1>
                {invite.hosts.person1}
                {invite.hosts.person2 && (
                  <>
                    {" "}
                    <em>&</em> {invite.hosts.person2}
                  </>
                )}
              </h1>
              {(hasFamily(invite.hosts.family1) ||
                hasFamily(invite.hosts.family2)) && (
                <div className="invitation-families">
                  <FamilyLines
                    name={invite.hosts.person1}
                    family={invite.hosts.family1}
                  />
                  <FamilyLines
                    name={invite.hosts.person2}
                    family={invite.hosts.family2}
                  />
                </div>
              )}
            </div>
            {popped && !flowers && (
              <ConfettiBurst onSettled={() => setFlowers(true)} />
            )}
            {eventDateValid && (
              <div className="invitation-date">
                <ScratchInvitation
                  theme={theme}
                  event={event}
                  onReveal={() => setPopped(true)}
                />
              </div>
            )}
            <a
              className="invitation-scroll"
              href="#venue"
              aria-label="Scroll to venue"
            >
              <ArrowDown size={20} />
            </a>
            {artState !== "ready" && (
              <div className="opening-status" role="status">
                {artState === "loading" ? (
                  <>
                    <LoaderCircle className="loading-spinner" />
                    <p>
                      {slowLoad
                        ? "Still loading — this can take longer on a slow connection…"
                        : "Preparing your invitation…"}
                    </p>
                  </>
                ) : (
                  <>
                    <p>Invitation artwork couldn’t load.</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setArtState("loading");
                        setAttempt((a) => a + 1);
                      }}
                    >
                      <RotateCcw size={16} /> Retry invitation
                    </Button>
                  </>
                )}
              </div>
            )}
          </section>

          <section className="venue-section" id="venue">
            <MapPin size={22} strokeWidth={1.3} />
            {event.venueName ? (
              <a
                href={
                  safeExternalUrl(event.venueMapsUrl) ??
                  venueMapsHref(event.venueName, event.venueAddress)
                }
                target="_blank"
                rel="noreferrer"
              >
                {event.venueName} <ArrowUpRight size={20} />
              </a>
            ) : (
              <span className="venue-name">Venue to be announced</span>
            )}
            {event.venueAddress && (
              <p className="venue-address">{event.venueAddress}</p>
            )}
            {event.muhuratText && (
              <p className="venue-muhurat">{event.muhuratText}</p>
            )}
            {event.dressCode && (
              <p className="venue-dress">Dress code · {event.dressCode}</p>
            )}
            {eventDateValid && eventDay !== "past" && (
              <div
                className="countdown"
                role="timer"
                aria-label={`Countdown to ${event.typeLabel.toLowerCase()}`}
              >
                {["Days", "Hours", "Minutes", "Seconds"].map((label, i) => (
                  <div key={label}>
                    <strong>
                      {time ? String(time[i]).padStart(2, "0") : "—"}
                    </strong>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {invite.subEvents && invite.subEvents.length > 0 && (
            <section className="sub-events">
              {/* Task 15: the per-event h3s need an h2 parent or the
                  heading outline skips a level after the title h1. */}
              <h2 className="sr-only">Celebrations</h2>
              {invite.subEvents.map((sub) => {
                const subVenueUrl = safeExternalUrl(sub.venueMapsUrl);
                return (
                  <div key={sub.label} className="sub-event">
                    <span className="sub-event-rule" aria-hidden="true" />
                    <h3>{sub.label}</h3>
                    <p>{sub.dateText}</p>
                    <p>{sub.timeText}</p>
                    {sub.venueName &&
                      (subVenueUrl ? (
                        <a
                          className="sub-event-venue"
                          href={subVenueUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {sub.venueName} <ArrowUpRight size={13} />
                        </a>
                      ) : (
                        <p className="sub-event-venue">{sub.venueName}</p>
                      ))}
                    {sub.dressCode && (
                      <p className="sub-event-dress">{sub.dressCode}</p>
                    )}
                    {sub.note && <p className="sub-event-note">{sub.note}</p>}
                  </div>
                );
              })}
            </section>
          )}

          {invite.familyMembers && invite.familyMembers.length > 0 && (
            <section className="family-section">
              <span className="section-ornament" aria-hidden="true">
                {theme.ornament}
              </span>
              <h2>With love from</h2>
              <ul>
                {invite.familyMembers.map((member) => (
                  <li key={`${member.name}-${member.role}`}>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ring && (
            <section className="ring-section">
              <img
                src={ringUrl}
                width={ring.width}
                height={ring.height}
                alt={ring.alt}
                loading="lazy"
              />
            </section>
          )}

          {(story?.quote || childhood) && (
            <section className="love-section">
              <span className="quote-ornament" aria-hidden="true">
                {theme.ornament}
              </span>
              {story?.quote && (
                <blockquote>
                  {story.quote.split("\n").map((line, i, all) => (
                    <span key={line}>
                      {line}
                      {i < all.length - 1 && <br />}
                    </span>
                  ))}
                </blockquote>
              )}
              {childhood && (
                <img
                  src={childhoodUrl}
                  width={childhood.width}
                  height={childhood.height}
                  alt={childhood.alt}
                  loading="lazy"
                />
              )}
            </section>
          )}

          {(forever || sinceIso) && (
            <section
              className="forever-section"
              aria-labelledby="forever-heading"
            >
              <span className="forever-rule" aria-hidden="true" />
              <h2 id="forever-heading">Always and Forever</h2>
              <InfinityIcon
                className="forever-infinity"
                size={58}
                strokeWidth={1}
                aria-label="Infinity"
              />
              {forever && (
                <img
                  src={foreverUrl}
                  width={forever.width}
                  height={forever.height}
                  alt={forever.alt}
                  loading="lazy"
                />
              )}
              {hasValidTogetherDate(sinceIso) && (
                <div className="together-milestone">
                  <p>Our story began</p>
                  <time dateTime={sinceIso.slice(0, 10)}>
                    {story?.togetherSinceText}
                  </time>
                  <div
                    className="together-calendar"
                    aria-label="Calendar time together"
                  >
                    {["Years", "Months", "Days"].map((label, i) => (
                      <div key={label}>
                        <strong>{duration?.[i] ?? "—"}</strong>
                        <span>{pluralLabel(duration?.[i], label)}</span>
                      </div>
                    ))}
                  </div>
                  <p className="together-counting">together &amp; counting</p>
                  <p className="together-elapsed-label">
                    Every single minute of it
                  </p>
                  <div
                    className="together-elapsed"
                    aria-label="Total days, hours and minutes together"
                  >
                    {["Days", "Hours", "Minutes"].map((label, i) => (
                      <div key={label}>
                        <strong>
                          {elapsed?.[i]?.toLocaleString("en-GB") ?? "—"}
                        </strong>
                        <span>{pluralLabel(elapsed?.[i], label)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {(invite.logistics?.transport ||
            invite.logistics?.accommodation ||
            invite.logistics?.note) && (
            <section className="logistics-section">
              <span className="section-ornament" aria-hidden="true">
                {theme.ornament}
              </span>
              <h2>Getting there</h2>
              <div className="logistics-grid">
                {invite.logistics.transport && (
                  <div>
                    <h3>Travel</h3>
                    <p>{invite.logistics.transport}</p>
                  </div>
                )}
                {invite.logistics.accommodation && (
                  <div>
                    <h3>Where to stay</h3>
                    <p>{invite.logistics.accommodation}</p>
                  </div>
                )}
                {invite.logistics.note && (
                  <div>
                    <h3>Good to know</h3>
                    <p>{invite.logistics.note}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {invite.rsvp?.enabled && (
            <section className="rsvp-section">
              <span className="section-ornament" aria-hidden="true">
                {theme.ornament}
              </span>
              <h2>Kindly reply</h2>
              {invite.rsvp.byDateText && (
                <p className="rsvp-by">by {invite.rsvp.byDateText}</p>
              )}
              <div className="rsvp-actions">
                {invite.rsvp.whatsapp && (
                  <a
                    href={`https://wa.me/${invite.rsvp.whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp <ArrowUpRight size={15} />
                  </a>
                )}
                {invite.rsvp.phone && (
                  <a
                    href={`tel:${invite.rsvp.phone.trim().startsWith("+") ? "+" : ""}${invite.rsvp.phone.replace(/[^0-9]/g, "")}`}
                  >
                    {invite.rsvp.phone}
                  </a>
                )}
                {invite.rsvp.email && (
                  <a
                    href={`mailto:${invite.rsvp.email.replace(/[\s"'<>]/g, "")}`}
                  >
                    {invite.rsvp.email}
                  </a>
                )}
              </div>
            </section>
          )}

          {invite.hashtag && (
            <section className="hashtag-section">
              <p>{invite.hashtag}</p>
            </section>
          )}

          {flowers && petals !== "none" && (
            <div
              className={`flower-shower petals petals-${petals}`}
              aria-hidden="true"
            >
              {Array.from({ length: 18 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
          )}
          {/* The dock renders whenever the invitation is open. The
              music controls inside it exist only when there is a track
              to control — the couple's own song or the theme's
              default — but Restart is not a music control: guests of
              silent themes get it too (Release Fix 11 / C-6 — it used
              to sit inside the hasMusic gate, so 13 of 14 designs had
              no way back to the envelope). */}
          <div className={`music-dock ${showDockHint ? "show-hint" : ""}`}>
            {hasMusic && (
              <span className="music-dock-item">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={toggleMusic}
                  aria-label={
                    music ? "Pause background music" : "Play background music"
                  }
                  title={music ? "Pause music" : "Play music"}
                >
                  {music ? <Volume2 /> : <VolumeX />}
                </Button>
                <span className="music-dock-hint" aria-hidden="true">
                  {music ? "Pause music" : "Play music"}
                </span>
              </span>
            )}
            <span className="music-dock-item">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Restart the invitation from the envelope"
                title="Restart invitation"
                onClick={() => window.location.reload()}
              >
                <RotateCcw />
              </Button>
              <span className="music-dock-hint" aria-hidden="true">
                Restart
              </span>
            </span>
            {hasMusic && audioError && (
              <div className="music-error" role="status">
                <p>{audioError}</p>
                <Button
                  variant="ghost"
                  onClick={() => {
                    audio.current?.load();
                    startMusic();
                  }}
                >
                  <RotateCcw size={14} /> Retry music
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    cancelAnimationFrame(fade.current);
                    audio.current?.pause();
                    setMusic(false);
                    setAudioError("");
                  }}
                >
                  <VolumeX size={14} /> Continue without music
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
