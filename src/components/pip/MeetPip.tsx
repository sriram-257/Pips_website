import { useState } from "react";
import portrait from "@/assets/pip_portrait.jpg.asset.json";
import { SectionHeading, Star } from "./Decor";
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

export function MeetPip() {
  const [line, setLine] = useState("Tap me! I don't bite — I don't even have teeth.");
  const [boop, setBoop] = useState(0);
  const react = () => {
    let next = line;
    while (next === line) next = LINES[Math.floor(Math.random() * LINES.length)];
    setLine(next);
    setBoop((b) => b + 1);
    blip("sparkle");
  };
  return (
    <section id="meet" className="relative scroll-mt-20 px-4 py-24">
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
