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
import {
  musicFadeVolume,
  remainingTime,
  togetherDuration,
  togetherElapsed,
} from "@/lib/invitation";
import { paletteVariables, type Theme } from "@/themes/types";
import {
  galleryImage,
  hostNames,
  monogram,
  type Invite,
} from "@/invites/types";

const SEAL_CLICK = "/audio/seal-click.wav";

/**
 * The invite engine. Everything it draws comes from `theme` (how it looks)
 * and `invite` (whose event it is) — it holds no event details of its own.
 */
export function Invitation({
  theme,
  invite,
}: {
  theme: Theme;
  invite: Invite;
}) {
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [artState, setArtState] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const [time, setTime] = useState<number[] | null>(null);
  const [duration, setDuration] = useState<[number, number, number] | null>(
    null,
  );
  const [elapsed, setElapsed] = useState<[number, number, number] | null>(null);
  const [music, setMusic] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [flowers, setFlowers] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const sealAudio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fade = useRef(0);
  const primedPlayback = useRef<Promise<void> | null>(null);
  const opened = useRef(false);
  const completeIntro = useCallback(() => setIntroDone(true), []);

  const { sealedBackdrop, revealedBackdrop, sealDisc, defaultMusic } =
    theme.assets;
  const { reveal, openMs, introSeconds, musicFadeMs, maxVolume, petals } =
    theme.motion;
  const { event, story } = invite;
  const musicUrl = invite.music?.url ?? defaultMusic;
  const names = hostNames(invite);
  const initials = monogram(invite);
  const ring = galleryImage(invite, "ring");
  const childhood = galleryImage(invite, "childhood");
  const forever = galleryImage(invite, "forever");
  const sinceIso = story?.togetherSinceIso;

  useEffect(() => {
    let cancelled = false;
    const sources = [
      sealedBackdrop,
      revealedBackdrop,
      ring?.url,
      childhood?.url,
    ].filter(Boolean) as string[];
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
          clearTimeout(deadline);
          setArtState("ready");
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearTimeout(deadline);
          setArtState("error");
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(deadline);
    };
  }, [attempt, sealedBackdrop, revealedBackdrop, ring?.url, childhood?.url]);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      setTime(remainingTime(now, event.startIso));
      if (sinceIso) {
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
    timer.current = setTimeout(() => {
      opened.current = true;
      setOpen(true);
      setOpening(false);
      musicDelay.current = setTimeout(startMusic, 1000);
    }, openMs);
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
      style={paletteVariables(theme) as React.CSSProperties}
    >
      <audio
        ref={sealAudio}
        src={SEAL_CLICK}
        preload="auto"
        aria-hidden="true"
      />
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
      {!open ? (
        <section className={`sealed-stage ${opening ? "opening-stage" : ""}`}>
          <img
            src={sealedBackdrop}
            className="sealed-backdrop"
            alt=""
            width={1536}
            height={1024}
            fetchPriority="high"
          />
          <RevealStage
            reveal={reveal}
            initials={initials}
            {...(invite.sealImage ? { sealImage: invite.sealImage } : {})}
            {...(sealDisc ? { sealDisc } : {})}
            label={event.typeLabel}
            hosts={names}
            opening={opening}
            onOpen={openEnvelope}
          />
        </section>
      ) : (
        <div className="opened-invitation">
          <section className="skyline-invitation">
            <img
              src={revealedBackdrop}
              className="skyline-backdrop"
              width={1536}
              height={1024}
              alt=""
              fetchPriority="high"
            />
            <div className="skyline-veil" />
            <CinematicInvite
              running={artState === "ready" && !introDone}
              seconds={introSeconds}
              onComplete={completeIntro}
            />
            <div className="invitation-heading">
              <p>{event.typeLabel}</p>
              <span className="heading-rule" />
            </div>
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
            </div>
            <div className="invitation-date">
              <ScratchInvitation
                theme={theme}
                event={event}
                onReveal={() => setFlowers(true)}
              />
            </div>
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
                    <p>Preparing your invitation…</p>
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
            {event.venueMapsUrl ? (
              <a href={event.venueMapsUrl} target="_blank" rel="noreferrer">
                {event.venueName} <ArrowUpRight size={20} />
              </a>
            ) : (
              <span className="venue-name">{event.venueName}</span>
            )}
            <div
              className="countdown"
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
          </section>

          {invite.subEvents && invite.subEvents.length > 0 && (
            <section className="sub-events">
              {invite.subEvents.map((sub) => (
                <div key={sub.label} className="sub-event">
                  <h3>{sub.label}</h3>
                  <p>{sub.dateText}</p>
                  <p>{sub.timeText}</p>
                  {sub.venueName && (
                    <p className="sub-event-venue">{sub.venueName}</p>
                  )}
                </div>
              ))}
            </section>
          )}

          {ring && (
            <section className="ring-section">
              <img
                src={ring.url}
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
                  src={childhood.url}
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
                  src={forever.url}
                  width={forever.width}
                  height={forever.height}
                  alt={forever.alt}
                  loading="lazy"
                />
              )}
              {sinceIso && (
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
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="together-counting">together &amp; counting</p>
                  <div
                    className="together-elapsed"
                    aria-label="Total days, hours and minutes together"
                  >
                    {["Days", "Hours", "Minutes"].map((label, i) => (
                      <div key={label}>
                        <strong>
                          {elapsed?.[i]?.toLocaleString("en-GB") ?? "—"}
                        </strong>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
          <div className="music-dock">
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
            <Button
              size="icon"
              variant="ghost"
              aria-label="Restart the invitation from the envelope"
              title="Restart invitation"
              onClick={() => window.location.reload()}
            >
              <RotateCcw />
            </Button>
            {audioError && (
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
