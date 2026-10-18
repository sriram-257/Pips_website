import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/pip_portrait.jpg.asset.json";
import { SectionHeading, Star, StarField } from "./Decor";
import { blip } from "@/lib/sound";

const LINES = [
  "Boop! You found my favourite button.",
  "I keep a spare moonbeam in my nightcap, just in case.",
  "Shh… the clouds are napping.",
  "Today I taught a star to hum.",
  "Every dream needs a cozy corner. I'm building yours!",
  "My skull is just a very round smile.",
];
const TRAITS = [
  ["Curious", "Asks the moon a new question every night."],
  ["Kind", "Leaves night-lights on for nervous dreamers."],
  ["Slightly sleepy", "Yawns at exactly 3:07 a.m., every time."],
];

/**
 * Pupil glint overlay — two tiny glow dots aligned with the highlights already
 * painted in the official portrait. They drift a few px toward the pointer on
 * desktop (fine pointer, no reduced motion) and rest exactly on the painted
 * highlights otherwise, so the artwork is never altered. Touch users keep the
 * existing tap/boop reaction instead.
 */
function PupilGlints({ anchor }: { anchor: React.RefObject<HTMLElement | null> }) {
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const MAX = 4; // px, clamped
    let raf = 0;
    const apply = (dx: number, dy: number) => {
      for (const el of [left.current, right.current]) {
        if (el) el.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const fig = anchor.current;
      if (!fig) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = fig.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        apply(Math.max(-MAX, Math.min(MAX, nx * MAX)), Math.max(-MAX, Math.min(MAX, ny * MAX)));
      });
    };
    const reset = () => { cancelAnimationFrame(raf); apply(0, 0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [anchor]);
  const dot = "pointer-events-none absolute rounded-full transition-transform duration-150 ease-out motion-reduce:transition-none";
  const glow: React.CSSProperties = { background: "radial-gradient(circle, #fff8e8 0%, #ffe9b8 55%, transparent 75%)", width: "4.5%", aspectRatio: "1" };
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span ref={left} className={dot} style={{ ...glow, left: "39.5%", top: "42.3%" }} />
      <span ref={right} className={dot} style={{ ...glow, left: "61.8%", top: "37.6%" }} />
    </div>
  );
}

export function MeetPip() {
  const figRef = useRef<HTMLElement>(null);
  const [line, setLine] = useState("Tap me! I don't bite — I don't even have teeth.");
  const [boop, setBoop] = useState(0);
  const react = () => {
    let next = line;
    while (next === line) next = LINES[Math.floor(Math.random() * LINES.length)]!;
    setLine(next);
    setBoop((b) => b + 1);
    blip("sparkle");
  };
  return (
    <section id="meet" className="relative isolate px-4 py-24">
      <StarField count={14} seed={11} className="chaos-only -z-10" />
      <SectionHeading kicker="Character profile" title="Meet Pip" />
      <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <div className="reveal relative mx-auto w-full max-w-xs">
          <button onClick={react} aria-label="Boop Pip for a friendly message" className="group block w-full">
            <figure key={boop} className={`portrait-frame aspect-[682/1024] rounded-[2rem] transition-transform group-hover:-translate-y-2 group-hover:rotate-[-2deg] ${boop ? "animate-wiggle" : ""}`}>
              <img src={portrait.url} alt="Official portrait of Pip holding a lantern and a tiny music box" className="h-full w-full object-cover" loading="lazy" width={682} height={1024} />
            </figure>
          </button>
          <div role="status" aria-live="polite" key={line} className="paper animate-pop absolute -right-4 -top-8 max-w-[14rem] rounded-2xl rounded-bl-none px-4 py-3 text-sm sm:-right-16">
            {line}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">Boops given: {boop}</p>
        </div>

        <div className="reveal space-y-6">
          <div>
            <h3 className="text-3xl font-semibold">Pip</h3>
            <p className="font-display text-primary">Junior Dream Engineer · Midnight Nursery</p>
          </div>
          <p className="handwritten text-xl leading-relaxed">
            “Hello, sleepy human! I'm Pip. I collect stray moonbeams, fix wobbly dream bridges, and make sure every sleepyhead gets somewhere wonderful to wander.”
          </p>
          <ul className="grid gap-3 sm:grid-cols-3">
            {TRAITS.map(([t, d]) => (
              <li key={t} className="rounded-2xl border-2 border-dashed border-border bg-paper p-4">
                <p className="flex items-center gap-2 font-display font-semibold"><Star size={12} /> {t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
          <div className="paper rounded-2xl p-5">
            <p className="chip">Current assignment</p>
            <p className="mt-3 font-display text-lg">Re-stitching the edge of a dream about a whale who reads bedtime stories.</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={72} aria-valuemin={0} aria-valuemax={100} aria-label="Assignment progress">
              <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">72% stitched · tea break at 3:07 a.m.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
