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
 * Cursor reaction — the whole portrait card gently leans/tilts toward the
 * pointer (clamped, ~10px + a whisper of rotation) while the pointer is near
 * Pip, and settles back when it moves away. Desktop only (fine pointer, no
 * reduced motion); touch users keep the tap/boop reaction. The official
 * artwork itself is never altered.
 */
function useCursorLean(target: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    const MAX = 10; // px, clamped
    const TILT = 2.5; // deg, clamped
    let raf = 0;
    const apply = (dx: number, dy: number, rz: number) => {
      const el = target.current;
      if (el) el.style.transform = `translate(${dx}px, ${dy}px) rotate(${rz}deg)`;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      const el = target.current;
      if (!el) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const nx = (e.clientX - cx) / (r.width / 2);
        const ny = (e.clientY - cy) / (r.height / 2);
        // Only react while the pointer is near the portrait (within ~1.6x its bounds).
        if (Math.abs(nx) > 1.6 || Math.abs(ny) > 1.6) { apply(0, 0, 0); return; }
        const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
        apply(clamp(nx * MAX, MAX), clamp(ny * MAX, MAX), clamp(nx * TILT, TILT));
      });
    };
    const reset = () => { cancelAnimationFrame(raf); apply(0, 0, 0); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [target]);
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
            <figure ref={figRef} key={boop} className={`portrait-frame relative aspect-[682/1024] rounded-[2rem] transition-transform group-hover:-translate-y-2 group-hover:rotate-[-2deg] ${boop ? "animate-wiggle" : ""}`}>
              <img src={portrait.url} alt="Official portrait of Pip holding a lantern and a tiny music box" className="h-full w-full object-cover" loading="lazy" width={682} height={1024} />
              <PupilGlints anchor={figRef} />
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
