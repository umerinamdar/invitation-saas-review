import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, Infinity as InfinityIcon, LoaderCircle, MapPin, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScratchInvitation } from '@/components/scratch-invitation';
import { CinematicInvite } from '@/components/cinematic-invite';
import { ENVELOPE_OPEN_MS, MUSIC_FADE_MS, musicFadeVolume, remainingTime, togetherDuration, togetherElapsed, VENUE_URL } from '@/lib/invitation';
import silk from '@/assets/sealed-silk.jpg';
import skyline from '@/assets/burj-skyline.jpg';
import seal from '@/assets/wax-seal.png';
import couple from '@/assets/couple-cartoon-palm-refined.jpg';
import portrait from '@/assets/couple-children-matched.jpg';
import forever from '@/assets/couple-forever.jpg';
import musicAsset from '@/assets/music/invitation-new-song.mp3.asset.json';
import sealClickAsset from '@/assets/music/seal-click.wav.asset.json';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Umer & Maimoona | Engagement Invitation' },
    { name: 'description', content: 'Celebrate Umer and Maimoona’s engagement on 22 November 2026, 7 PM onwards at Iris Banquet and Lawn.' },
    { property: 'og:title', content: 'Umer & Maimoona — Engagement Invitation' },
    { property: 'og:description', content: 'Two traditions, one faith, united by endless love. 22 November 2026 at Iris Banquet and Lawn.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});
function Index() {
  const [open, setOpen] = useState(false);
  const [opening, setOpening] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [artState, setArtState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const [time, setTime] = useState<number[] | null>(null);
  const [duration, setDuration] = useState<[number, number, number] | null>(null);
  const [elapsed, setElapsed] = useState<[number, number, number] | null>(null);
  const [music, setMusic] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [flowers, setFlowers] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const sealAudio = useRef<HTMLAudioElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const musicDelay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fade = useRef(0);
  const primedPlayback = useRef<Promise<void> | null>(null);
  const opened = useRef(false);
  const completeIntro = useCallback(() => setIntroDone(true), []);
  useEffect(() => {
    let cancelled = false;
    const deadline = setTimeout(() => { if (!cancelled) setArtState('error'); }, 12000);
    Promise.all([silk, skyline, couple, portrait].map(src => new Promise<void>((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(); image.onerror = () => reject(new Error('Artwork unavailable')); image.src = src;
    }))).then(() => { if (!cancelled) { clearTimeout(deadline); setArtState('ready'); } }).catch(() => { if (!cancelled) { clearTimeout(deadline); setArtState('error'); } });
    return () => { cancelled = true; clearTimeout(deadline); };
  }, [attempt]);
  useEffect(() => {
    const update = () => { const now = Date.now(); setTime(remainingTime(now)); setDuration(togetherDuration(now)); setElapsed(togetherElapsed(now)); };
    update();
    const id = setInterval(update, 1000);
    return () => { clearInterval(id); if (timer.current) clearTimeout(timer.current); if (musicDelay.current) clearTimeout(musicDelay.current); cancelAnimationFrame(fade.current); };
  }, []);
  async function startMusic() {
    const player = audio.current; if (!player) return;
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
      setMusic(true); setAudioError('');
      let elapsedMs = 0;
      let previous = performance.now();
      const swell = (now: number) => {
        if (player.paused) return;
        // A buffering gap must not turn into a sudden volume jump on resume.
        if (player.readyState >= 3) elapsedMs += Math.min(now - previous, 100);
        previous = now;
        player.volume = musicFadeVolume(elapsedMs);
        if (elapsedMs < MUSIC_FADE_MS) fade.current = requestAnimationFrame(swell);
      };
      fade.current = requestAnimationFrame(swell);
    } catch { setMusic(false); setAudioError('Music couldn’t play.'); }
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
      player.muted = true; player.volume = 0;
      primedPlayback.current = player.play();
      // Observe failure now; startMusic retains the original promise and reports it after opening.
      void primedPlayback.current.catch(() => {});
    }
    timer.current = setTimeout(() => { opened.current = true; setOpen(true); setOpening(false); musicDelay.current = setTimeout(startMusic, 1000); }, ENVELOPE_OPEN_MS);
  }
  function toggleMusic() {
    if (music) { cancelAnimationFrame(fade.current); audio.current?.pause(); setMusic(false); }
    else startMusic();
  }
  return <main className="new-invitation">
    <audio ref={sealAudio} src={sealClickAsset.url} preload="auto" aria-hidden="true" />
    <audio ref={audio} src={musicAsset.url} loop preload="auto" onError={() => { setMusic(false); if (opened.current) setAudioError('Music couldn’t load.'); }} />
    {!open ? <section className={`sealed-stage ${opening ? 'opening-stage' : ''}`}>
      <img src={silk} className="sealed-backdrop" alt="Pearl silk invitation backdrop" width={1536} height={1024} fetchPriority="high" />
      <div className={`envelope ${opening ? 'is-opening' : ''}`}>
        <div className="envelope-paper" /><div className="envelope-flap" /><div className="envelope-bottom" />
        <span className="envelope-line left-line" /><span className="envelope-line right-line" />
        <Button variant="ghost" className="seal-button" onClick={openEnvelope} disabled={opening} aria-label="Break the UM wax seal and open invitation"><img src={seal} width={816} height={816} alt="UM embossed wax seal" /></Button>
        <Button variant="ghost" className="envelope-label" onClick={openEnvelope} disabled={opening}>Engagement Invitation <ArrowUpRight /></Button>
      </div>
    </section> : <div className="opened-invitation">
      <section className="skyline-invitation">
        <img src={skyline} className="skyline-backdrop" width={1536} height={1024} alt="Burj Khalifa skyline framed by powder-blue florals and a grand arch" fetchPriority="high" />
        <div className="skyline-veil" />
        <CinematicInvite running={artState === 'ready' && !introDone} onComplete={completeIntro} />
        <div className="invitation-heading"><p>Engagement Ceremony</p><span className="heading-rule" /></div>
        <div className="invitation-names"><h1>Umer <em>&</em> Maimoona</h1></div>
        <div className="invitation-date"><ScratchInvitation onReveal={() => setFlowers(true)} /></div>
        <a className="invitation-scroll" href="#venue" aria-label="Scroll to venue"><ArrowDown size={20} /></a>
        {artState !== 'ready' && <div className="opening-status" role="status">{artState === 'loading' ? <><LoaderCircle className="loading-spinner" /><p>Preparing your invitation…</p></> : <><p>Invitation artwork couldn’t load.</p><Button variant="outline" onClick={() => { setArtState('loading'); setAttempt(a => a + 1); }}><RotateCcw size={16} /> Retry invitation</Button></>}</div>}
      </section>
      <section className="venue-section" id="venue">
        <MapPin size={22} strokeWidth={1.3} />
        <a href={VENUE_URL} target="_blank" rel="noreferrer">Iris Banquet and Lawn <ArrowUpRight size={20} /></a>
        <div className="countdown" aria-label="Countdown to engagement">{['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => <div key={label}><strong>{time ? String(time[i]).padStart(2, '0') : '—'}</strong><span>{label}</span></div>)}</div>
      </section>
      <section className="ring-section"><img src={couple} width={1264} height={848} alt="Cartoon illustration of Umer and Maimoona’s ring exchange overlooking Palm Jumeirah’s turquoise waterfront" loading="lazy" /></section>
      <section className="love-section"><span className="quote-ornament" aria-hidden="true">✧</span><blockquote>Two traditions, one faith,<br />united by endless love.</blockquote><img src={portrait} width={928} height={1152} alt="Illustration of Umer and Maimoona as little children holding hands beneath a silhouette of their engagement" loading="lazy" /></section>
      <section className="forever-section" aria-labelledby="forever-heading">
        <span className="forever-rule" aria-hidden="true" />
        <h2 id="forever-heading">Always and Forever</h2>
        <InfinityIcon className="forever-infinity" size={58} strokeWidth={1} aria-label="Infinity" />
        <img src={forever} width={928} height={1152} alt="Illustration of Umer and Maimoona holding hands, seen from behind in a navy suit and embroidered ivory bridal dress" loading="lazy" />
        <div className="together-milestone">
          <p>Our story began</p>
          <time dateTime="2024-08-11">11 August 2024</time>
          <div className="together-calendar" aria-label="Calendar time together">
            {['Years', 'Months', 'Days'].map((label, i) => <div key={label}><strong>{duration?.[i] ?? '—'}</strong><span>{label}</span></div>)}
          </div>
          <p className="together-counting">together & counting</p>
          <div className="together-elapsed" aria-label="Total days, hours and minutes since the start of 11 August 2024">
            {['Days', 'Hours', 'Minutes'].map((label, i) => <div key={label}><strong>{elapsed?.[i]?.toLocaleString('en-GB') ?? '—'}</strong><span>{label}</span></div>)}
          </div>
        </div>
      </section>
      {flowers && <div className="flower-shower petals" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>}
      <div className="music-dock"><Button size="icon" variant="ghost" onClick={toggleMusic} aria-label={music ? 'Pause background music' : 'Play background music'} title={music ? 'Pause music' : 'Play music'}>{music ? <Volume2 /> : <VolumeX />}</Button><Button size="icon" variant="ghost" aria-label="Restart the invitation from the envelope" title="Restart invitation" onClick={() => window.location.reload()}><RotateCcw /></Button>{audioError && <div className="music-error" role="status"><p>{audioError}</p><Button variant="ghost" onClick={() => { audio.current?.load(); startMusic(); }}><RotateCcw size={14} /> Retry music</Button><Button variant="ghost" onClick={() => { cancelAnimationFrame(fade.current); audio.current?.pause(); setMusic(false); setAudioError(''); }}><VolumeX size={14} /> Continue without music</Button></div>}</div>
    </div>}
  </main>;
}
