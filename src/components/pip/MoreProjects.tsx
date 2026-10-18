import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import lantern from "@/assets/pip_dream_lantern.jpg.asset.json";
import { Star } from "./Decor";
import { blip } from "@/lib/sound";

const card = "reveal paper relative overflow-hidden rounded-[2rem] p-6 sm:p-8 scroll-mt-28";

const LAMPS = [
  { name: "Crescent Dream Lantern", icon: "🌙", text: "Pip's favourite. Glows brighter when someone nearby is having a happy dream." },
  { name: "Jellyfish Bedside Lamp", icon: "🪼", text: "Floats gently above the pillow and hums one very quiet note." },
  { name: "Mushroom Toadstool Light", icon: "🍄", text: "Warm spotted glow. Keeps the closet monsters politely shy." },
  { name: "Firefly Jar", icon: "🫙", text: "Borrowed fireflies, always returned by sunrise with a thank-you note." },
];

export function NightlightCollection() {
  const [sel, setSel] = useState(0);
  const [on, setOn] = useState<boolean[]>([true, false, false, false]);
  const l = LAMPS[sel]!;
  const pick = (i: number) => { setSel(i); setOn((o) => o.map((v, j) => (j === i ? !v || i !== sel : v))); blip("sparkle"); };
  return (
    <article id="nightlights" className={card}>
      <span className="chip">Gallery</span>
      <h3 className="mt-3 text-3xl font-semibold">Nightlight Collection</h3>
      <p className="mt-2 text-muted-foreground">Glowing lamps and bedside lanterns Pip designed. Tap one to switch it on and read its tag.</p>
      <div className="relative mx-auto mt-6 max-w-[14rem]">
        <span aria-hidden className={`absolute inset-0 -m-6 rounded-full transition-opacity duration-700 ${on[0] ? "opacity-100" : "opacity-0"}`} style={{ background: "radial-gradient(circle, var(--glow), transparent 65%)" }} />
        <img src={lantern.url} alt="Pip's glowing crescent-moon dream lantern" loading="lazy" width={1024} height={914}
          className={`portrait-frame relative aspect-[1024/914] w-full rounded-full object-cover transition-[filter] duration-700 ${on[0] ? "" : "brightness-[0.82] saturate-[0.8]"}`} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LAMPS.map((x, i) => (
          <button key={x.name} onClick={() => pick(i)} aria-pressed={on[i]} aria-label={`${x.name}, ${on[i] ? "on" : "off"}`}
            className={`rounded-2xl border-2 p-3 text-center transition-all ${i === sel ? "border-foreground" : "border-border"} ${on[i] ? "bg-paper shadow-[0_0_24px_var(--glow)]" : "bg-muted"}`}>
            <span aria-hidden className={`block text-3xl transition-opacity ${on[i] ? "" : "opacity-50"}`}>{x.icon}</span>
            <span className="mt-1 block font-display text-xs">{on[i] ? "On" : "Off"}</span>
          </button>
        ))}
      </div>
      <p role="status" aria-live="polite" className="mt-4 rounded-2xl border-2 border-dashed border-border bg-paper p-4">
        <b className="font-display">{l.name}</b> — {l.text}
      </p>
    </article>
  );
}

const BLOCKS = ["P", "I", "P", "★", "☾", "Z"];
export function RattleBlocks() {
  const [stack, setStack] = useState(0);
  const [shake, setShake] = useState(0);
  const add = () => { setStack((s) => Math.min(s + 1, BLOCKS.length)); blip(); };
  const rattle = () => { setShake((n) => n + 1); blip("sparkle"); };
  const msg = stack === 0 ? "No blocks yet. Stack one!" : stack < BLOCKS.length ? `${stack} block${stack > 1 ? "s" : ""} tall. Steady…` : "Tallest tower in the nursery! 🎉";
  return (
    <article id="toys" className={card}>
      <span className="chip">Playable</span>
      <h3 className="mt-3 text-3xl font-semibold">Rattle &amp; Block Toys</h3>
      <p className="mt-2 text-muted-foreground">Toys Pip invented for bedtime play. Stack the alphabet blocks and shake the star rattle.</p>
      <div className="mt-6 grid grid-cols-[1fr_auto] items-end gap-6">
        <div aria-hidden className="flex h-60 flex-col-reverse items-center justify-start rounded-3xl bg-muted p-3">
          {BLOCKS.slice(0, stack).map((b, i) => (
            <span key={i} className="animate-pop grid h-9 w-12 place-items-center rounded-lg border-2 border-foreground bg-secondary font-display text-lg" style={{ transform: `rotate(${(i % 2 ? 1 : -1) * 3}deg)` }}>{b}</span>
          ))}
        </div>
        <span key={shake} aria-hidden className={`block text-6xl ${shake ? "animate-[wiggle_0.5s_ease-in-out]" : ""}`}>🪇</span>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button onClick={add} disabled={stack >= BLOCKS.length} className="btn-dream disabled:opacity-40">Stack a block</button>
        <button onClick={rattle} className="btn-ghost-dream">Shake rattle ({shake})</button>
        <button onClick={() => { setStack(0); blip(); }} aria-label="Knock the tower down" className="btn-ghost-dream"><RotateCcw size={14} /> Reset</button>
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
