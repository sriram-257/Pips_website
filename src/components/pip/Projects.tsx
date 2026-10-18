import { useState } from "react";
import { Play, Square } from "lucide-react";
import lullaby from "@/assets/pip_lullaby_box.jpg.asset.json";
import lantern from "@/assets/pip_dream_lantern.jpg.asset.json";
import { Cloud, SectionHeading, Star } from "./Decor";
import { audioSupported, blip, startLullaby, stopLullaby } from "@/lib/sound";
import { useSettings } from "./settings";

const STOPS = [
  { name: "Puddle Peak", x: 15, y: 70, text: "A hill made of rain puddles you can bounce across without getting wet." },
  { name: "Biscuit Bay", x: 40, y: 30, text: "Warm sand that smells like cookies. The tide brings in soft blankets." },
  { name: "Owl Library", x: 68, y: 62, text: "Owls read aloud until you drift off. Late fees are paid in yawns." },
  { name: "Moon Dock", x: 85, y: 22, text: "Last stop. Visitors wave goodnight to the moon, and the moon waves back." },
];

function CloudRailway() {
  const [stop, setStop] = useState(0);
  const s = STOPS[stop]!;
  return (
    <article className="reveal paper relative overflow-hidden rounded-[2.5rem] p-6 sm:p-10 md:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-3xl font-semibold">The Cloud Railway</h3>
        <span className="chip">🚂 In service, mostly</span>
      </div>
      <p className="mt-2 max-w-xl text-muted-foreground">A tiny railway that carries sleepy visitors between floating islands. Tap a station to see where the train goes tonight.</p>
      <div className="relative mt-6 aspect-[4/3] sm:aspect-[16/7] rounded-3xl bg-muted">
        <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <polyline points={STOPS.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="0.8" strokeDasharray="3 3" className="animate-dash" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }} />
        </svg>
        {STOPS.map((p, i) => (
          <button key={p.name} onClick={() => { setStop(i); blip(); }} aria-pressed={i === stop} aria-label={`Go to ${p.name}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <Cloud className="w-16 sm:w-28" />
            <span className={`mt-[-0.6rem] block whitespace-nowrap rounded-full px-2 py-0.5 font-display text-xs ${i === stop ? "bg-primary text-primary-foreground" : "bg-paper"}`}>{p.name}</span>
          </button>
        ))}
        <span aria-hidden className="pointer-events-none absolute -translate-x-1/2 -translate-y-[160%] text-3xl transition-all duration-700" style={{ left: `${s.x}%`, top: `${s.y}%` }}>🚃</span>
      </div>
      <p role="status" aria-live="polite" key={stop} className="animate-pop mt-5 rounded-2xl border-2 border-dashed border-border bg-paper p-4">
        <b className="font-display">Now arriving: {s.name}.</b> {s.text}
      </p>
    </article>
  );
}

function LullabyMachine() {
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState("");
  const toggle = () => {
    if (playing) { stopLullaby(); setPlaying(false); return; }
    if (!audioSupported() || !startLullaby()) { setErr("Your browser can't play generated sound, but the box is still very pretty."); return; }
    setPlaying(true);
  };
  return (
    <article className="reveal relative overflow-hidden rounded-[2rem_6rem_2rem_2rem] border-2 border-foreground bg-secondary p-6 shadow-[var(--shadow-soft)] sm:p-8">
      <span className="chip">{playing ? "♪ Now playing" : "Dream in progress"}</span>
      <h3 className="mt-3 text-3xl font-semibold">The Lullaby Machine</h3>
      <p className="mt-2 text-muted-foreground">Turns gentle sounds into dreamscapes. Wind the key and listen to a tiny music-box tune, made on the spot.</p>
      <div className="relative mx-auto mt-6 max-w-xs">
        <img src={lullaby.url} alt="Pip's Lullaby Lab music box with a golden winding key and star chimes" loading="lazy"
          className={`portrait-frame aspect-[1024/924] w-full rounded-3xl object-cover ${playing ? "animate-float" : ""}`} width={1024} height={924} />
        {playing && ["♪", "♫", "♪"].map((n, i) => (
          <span key={i} aria-hidden className="animate-float absolute font-display text-3xl text-primary" style={{ left: `${10 + i * 38}%`, top: `${-8 + (i % 2) * 10}%`, animationDelay: `${i * 0.4}s` }}>{n}</span>
        ))}
      </div>
      <div aria-hidden className="mt-5 flex h-8 items-end justify-center gap-1">
        {Array.from({ length: 16 }, (_, i) => (
          <span key={i} className="w-1.5 rounded-full bg-primary transition-all duration-300" style={{ height: playing ? `${20 + Math.abs(Math.sin(i)) * 80}%` : "15%", animation: playing ? `twinkle ${0.8 + (i % 4) * 0.2}s ease-in-out infinite` : "none" }} />
        ))}
      </div>
      <button onClick={toggle} aria-pressed={playing} className="btn-dream mx-auto mt-5 flex">
        {playing ? <><Square size={16} /> Stop lullaby</> : <><Play size={16} /> Play lullaby</>}
      </button>
      {err && <p className="mt-3 text-center text-sm text-destructive">{err}</p>}
      <p className="mt-2 text-center text-xs text-muted-foreground">Plays only when you press it. Gentle volume.</p>
    </article>
  );
}

function LostStarLantern() {
  const [lit, setLit] = useState(false);
  const [found, setFound] = useState(0);
  const { night } = useSettings();
  const shine = () => { setLit(true); setFound((f) => Math.min(f + 1, 5)); blip("sparkle"); };
  return (
    <article className={`reveal relative overflow-hidden rounded-[6rem_2rem_2rem_2rem] border-2 border-foreground p-6 shadow-[var(--shadow-soft)] transition-colors duration-700 sm:p-8 ${lit || night ? "bg-card" : "bg-foreground text-background"}`}>
      <span className="chip text-foreground">{found >= 5 ? "All stars home ✨" : "Search party active"}</span>
      <h3 className="mt-3 text-3xl font-semibold">The Lost-Star Lantern</h3>
      <p className={`mt-2 ${lit || night ? "text-muted-foreground" : "opacity-80"}`}>A little lantern that helps lost stars find their way home. It's dark in here — tap the lantern.</p>
      <button onClick={shine} aria-label="Shine the lantern to find a lost star" className="relative mx-auto mt-6 block max-w-xs">
        <span aria-hidden className={`absolute inset-0 -m-10 rounded-full transition-opacity duration-700 ${lit ? "opacity-100" : "opacity-0"}`} style={{ background: "radial-gradient(circle, var(--glow), transparent 65%)" }} />
        <img src={lantern.url} alt="Pip's glowing crescent-moon dream lantern" loading="lazy" width={1024} height={914}
          className={`portrait-frame relative aspect-[1024/914] w-full rounded-full object-cover transition-[filter] duration-700 ${lit ? "" : "brightness-50 saturate-50"}`} />
      </button>
      <div className="mt-6 flex justify-center gap-3" aria-label={`${found} of 5 stars found`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} size={22} className={`transition-all duration-500 ${i < found ? "animate-twinkle opacity-100" : "opacity-20"}`} />
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-3 text-center font-display">
        {found === 0 ? "No stars found yet…" : found < 5 ? `Found star #${found}! It was hiding behind a sock.` : "Every lost star is home. They say thank you (very quietly)."}
      </p>
    </article>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-20 px-4 py-24">
      <SectionHeading kicker="Work in progress" title="Three dream projects">Little worlds Pip is building right now. Each one is a bit different. Poke them.</SectionHeading>
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
        <CloudRailway />
        <LullabyMachine />
        <LostStarLantern />
      </div>
    </section>
  );
}
