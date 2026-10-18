import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import lantern from "@/assets/pip_dream_lantern.jpg.asset.json";
import { Star } from "./Decor";
import { blip } from "@/lib/sound";

const card = "reveal paper relative overflow-hidden rounded-[2rem] p-6 sm:p-8 scroll-mt-28";

const LAMPS = [
  { name: "Crescent Dream Lantern", icon: "🌙", glow: "var(--glow)", text: "Pip's favourite. Glows brighter when someone nearby is having a happy dream." },
  { name: "Jellyfish Bedside Lamp", icon: "🪼", glow: "color-mix(in oklab, var(--primary) 60%, transparent)", text: "Floats gently above the pillow and hums one very quiet note." },
  { name: "Mushroom Toadstool Light", icon: "🍄", glow: "color-mix(in oklab, var(--destructive) 50%, transparent)", text: "Warm spotted glow. Keeps the closet monsters politely shy." },
  { name: "Firefly Jar", icon: "🫙", glow: "color-mix(in oklab, var(--moon) 75%, transparent)", text: "Borrowed fireflies, always returned by sunrise with a thank-you note." },
];

export function NightlightCollection() {
  const [sel, setSel] = useState(0);
  const [on, setOn] = useState<boolean[]>([true, false, false, false]);
  const l = LAMPS[sel]!;
  const lit = on[sel]!;
  const flip = () => { setOn((o) => o.map((v, j) => (j === sel ? !v : v))); blip("sparkle"); };
  return (
    <article id="nightlights" className={card}>
      <span className="chip">Gallery</span>
      <h3 className="mt-3 text-3xl font-semibold">Nightlight Collection</h3>
      <p className="mt-2 text-muted-foreground">Glowing lamps and bedside lanterns Pip designed. Pick a lamp, then flip its switch.</p>
      <div key={sel} className="animate-pop relative mx-auto mt-6 aspect-square w-full max-w-[14rem]">
        <span aria-hidden className={`absolute inset-0 -m-6 rounded-full transition-opacity duration-700 ${lit ? "opacity-100" : "opacity-0"}`} style={{ background: `radial-gradient(circle, ${l.glow}, transparent 65%)` }} />
        {sel === 0 ? (
          <img src={lantern.url} alt="Pip's glowing crescent-moon dream lantern" loading="lazy" width={1024} height={914}
            className={`portrait-frame relative h-full w-full rounded-full object-cover transition-[filter] duration-700 ${lit ? "" : "brightness-[0.82] saturate-[0.8]"}`} />
        ) : (
          <span role="img" aria-label={l.name} className={`portrait-frame relative grid h-full w-full place-items-center rounded-full bg-muted text-8xl transition-[filter,opacity] duration-700 ${lit ? "" : "opacity-50 grayscale"}`}
            style={lit ? { boxShadow: `0 0 50px ${l.glow}` } : undefined}>{l.icon}</span>
        )}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LAMPS.map((x, i) => (
          <button key={x.name} onClick={() => { setSel(i); blip(); }} aria-pressed={i === sel} aria-label={`Show ${x.name} (${on[i] ? "on" : "off"})`}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${i === sel ? "border-foreground bg-paper" : "border-border bg-muted"}`}
            style={on[i] ? { boxShadow: `0 0 18px ${x.glow}` } : undefined}>
            <span aria-hidden className={`block text-3xl ${on[i] ? "" : "opacity-50"}`}>{x.icon}</span>
            <span className="mt-1 block font-display text-xs">{on[i] ? "On" : "Off"}</span>
          </button>
        ))}
      </div>
      <button onClick={flip} role="switch" aria-checked={lit} className={`${lit ? "btn-ghost-dream" : "btn-dream"} mt-4 w-full justify-center`}>
        {lit ? `Switch off the ${l.name}` : `Switch on the ${l.name}`}
      </button>
      <p role="status" aria-live="polite" className="mt-4 rounded-2xl border-2 border-dashed border-border bg-paper p-4">
        <b className="font-display">{l.name}</b> ({lit ? "on" : "off"}) — {l.text}
      </p>
    </article>
  );
}

const WORDS = ["PIP", "STAR", "MOON", "DREAM", "SLEEP", "CLOUD", "BABY"];
const EXTRA = "ZQWXKVJ";
type Tile = { id: number; ch: string };
function makeRound(word: string, rnd: () => number): Tile[] {
  const chars = [...word, EXTRA[Math.floor(rnd() * EXTRA.length)]!, EXTRA[Math.floor(rnd() * EXTRA.length)]!];
  for (let i = chars.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [chars[i], chars[j]] = [chars[j]!, chars[i]!]; }
  return chars.map((ch, id) => ({ id, ch }));
}
let seedN = 3;
const fixedRnd = () => { seedN = (seedN * 9301 + 49297) % 233280; return seedN / 233280; };

export function RattleBlocks() {
  const [round, setRound] = useState(() => { seedN = 3; return { word: "PIP", tray: makeRound("PIP", fixedRnd) }; });
  const [stack, setStack] = useState<Tile[]>([]);
  const [shake, setShake] = useState(0);
  const [wobble, setWobble] = useState(false);
  const built = stack.map((t) => t.ch).join("");
  const won = built === round.word;
  const place = (t: Tile) => {
    if (won) return;
    const next = round.word[stack.length];
    if (t.ch !== next) { setWobble(true); setTimeout(() => setWobble(false), 600); blip(); return; }
    setStack((s) => [...s, t]); blip(stack.length + 1 === round.word.length ? "success" : "tap");
  };
  const newTower = () => {
    const pool = WORDS.filter((w) => w !== round.word);
    const word = pool[Math.floor(Math.random() * pool.length)]!;
    setRound({ word, tray: makeRound(word, Math.random) }); setStack([]); blip();
  };
  const rattle = () => { setShake((n) => n + 1); blip("sparkle"); };
  const used = new Set(stack.map((t) => t.id));
  const msg = won ? `You built ${round.word}! Tallest tower in the nursery 🎉` : wobble ? `Wobble! The next block should be “${round.word[stack.length]}”.` : stack.length ? `${built}… keep going!` : `Goal: spell ${round.word}, bottom to top.`;
  return (
    <article id="toys" className={card}>
      <span className="chip">Playable</span>
      <h3 className="mt-3 text-3xl font-semibold">Rattle &amp; Block Toys</h3>
      <p className="mt-2 text-muted-foreground">Toys Pip invented for bedtime play. Stack the letter blocks to spell the goal word, and shake the star rattle.</p>
      <p className="mt-4 font-display">Goal word: <span className="rounded-lg bg-primary px-2 py-0.5 text-primary-foreground">{round.word}</span></p>
      <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-6">
        <div aria-hidden className={`flex h-60 flex-col-reverse items-center justify-start rounded-3xl bg-muted p-3 ${wobble ? "animate-wiggle" : ""}`}>
          {stack.map((b, i) => (
            <span key={b.id} className="animate-pop grid h-9 w-12 place-items-center rounded-lg border-2 border-foreground bg-secondary font-display text-lg" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 3}deg)` }}>{b.ch}</span>
          ))}
        </div>
        <span key={shake} aria-hidden className={`block text-6xl ${shake ? "animate-wiggle" : ""}`}>🪇</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Blocks to stack">
        {round.tray.map((t) => (
          <button key={`${round.word}-${t.id}`} onClick={() => place(t)} disabled={used.has(t.id) || won} aria-label={`Stack block ${t.ch}`}
            className="grid h-11 w-11 place-items-center rounded-lg border-2 border-foreground bg-paper font-display text-lg disabled:opacity-30">{t.ch}</button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={newTower} className="btn-dream"><RotateCcw size={14} /> New tower</button>
        <button onClick={rattle} className="btn-ghost-dream">Shake rattle ({shake})</button>
      </div>
      <p role="status" aria-live="polite" className="mt-4 font-display">{msg}</p>
    </article>
  );
}

const PAGES = [
  { art: "🌙", title: "The Sleepy Moon", text: "Once upon a bedtime, the moon yawned so wide that three little stars tumbled out of the sky." },
  { art: "⭐", title: "Pip Hears a Twinkle", text: "Pip was oiling the dream gears when a tiny twinkle called from the rooftop: “We're lost!”" },
  { art: "☁️", title: "A Cloud Ride", text: "Pip hopped onto a cloud, tucked the stars in a blanket, and floated them gently upward." },
  { art: "💤", title: "Home Again", text: "The moon smiled, the stars twinkled back in place, and every child below slept a little sweeter. The end." },
];
export function Storybook() {
  const [p, setP] = useState(0);
  const pg = PAGES[p]!;
  const go = (d: number) => { setP((x) => Math.max(0, Math.min(PAGES.length - 1, x + d))); blip(); };
  return (
    <article id="storybook" className={card}>
      <span className="chip">Read along</span>
      <h3 className="mt-3 text-3xl font-semibold">Bedtime Storybook</h3>
      <p className="mt-2 text-muted-foreground">A short story Pip wrote. Turn the pages at your own pace.</p>
      <div className="mt-6 rounded-3xl border-2 border-foreground bg-paper p-6 text-center">
        <span aria-hidden className="block text-6xl">{pg.art}</span>
        <h4 className="mt-3 text-2xl font-semibold">{pg.title}</h4>
        <p className="handwritten mt-3 text-lg">{pg.text}</p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <button onClick={() => go(-1)} disabled={p === 0} className="btn-ghost-dream disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
        <span role="status" aria-live="polite" className="font-display text-sm">Page {p + 1} of {PAGES.length}</span>
        <button onClick={() => go(1)} disabled={p === PAGES.length - 1} className="btn-dream disabled:opacity-40">Next <ChevronRight size={16} /></button>
      </div>
    </article>
  );
}

const MILESTONES = [
  { label: "First star polished", done: true, note: "Took all night. The star was very ticklish." },
  { label: "Cloud steering", done: true, note: "Only bumped into the moon twice." },
  { label: "Lullaby composing", done: true, note: "Thirteen notes, zero wrong ones (allegedly)." },
  { label: "Nightmare untangling", done: false, note: "In training. Uses a soft comb and kind words." },
  { label: "Senior Dream Engineer", done: false, note: "Someday! Pip practises every bedtime." },
];
export function GrowthChart() {
  const [sel, setSel] = useState(2);
  const m = MILESTONES[sel]!;
  return (
    <article id="growth" className={card}>
      <span className="chip">Nursery wall</span>
      <h3 className="mt-3 text-3xl font-semibold">Pip's Growth Chart</h3>
      <p className="mt-2 text-muted-foreground">Pencil marks on the nursery wall, measuring skills — not inches. Tap a mark.</p>
      <ol className="mt-6 flex flex-col-reverse gap-2 border-l-4 border-dashed border-primary pl-4">
        {MILESTONES.map((x, i) => (
          <li key={x.label}>
            <button onClick={() => { setSel(i); blip(); }} aria-pressed={i === sel}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${i === sel ? "bg-primary text-primary-foreground" : "bg-paper"}`}>
              <Star size={14} className={x.done ? "" : "opacity-30"} />
              <span className="font-display">{x.label}</span>
              <span className="ml-auto text-xs">{x.done ? "Reached" : "Growing"}</span>
            </button>
          </li>
        ))}
      </ol>
      <p role="status" aria-live="polite" className="mt-4 rounded-2xl border-2 border-dashed border-border bg-paper p-4">
        <b className="font-display">{m.label}:</b> {m.note}
      </p>
    </article>
  );
}
