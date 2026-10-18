import { useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Cloud, SectionHeading, Star } from "./Decor";
import { useSettings } from "./settings";
import { blip } from "@/lib/sound";

type Key = "clouds" | "stars" | "moonbeams" | "lantern";
const INGREDIENTS: { key: Key; label: string; icon: string; dream: string }[] = [
  { key: "clouds", label: "Clouds", icon: "☁️", dream: "a bouncy castle in the sky" },
  { key: "stars", label: "Stars", icon: "⭐", dream: "a sky you can play hopscotch on" },
  { key: "moonbeams", label: "Moonbeams", icon: "🌙", dream: "a glowing forest" },
  { key: "lantern", label: "Lantern light", icon: "🏮", dream: "a cozy cabin with a crackling fire" },
];

export function describeDream(mix: Record<Key, number>, night: boolean): string {
  const picked = INGREDIENTS.filter((i) => mix[i.key] > 0);
  if (!picked.length) return "The dream jar is empty. Add an ingredient to begin!";
  const top = [...picked].sort((a, b) => mix[b.key] - mix[a.key])[0]!;
  const parts = picked.map((i) => `${mix[i.key]} ${i.label.toLowerCase()}`).join(", ");
  return `You added ${parts}. Tonight's dream might contain ${top.dream}${night ? ", under a sleepy lavender sky" : ", warmed by a peachy sunrise"}.`;
}

export function Workshop() {
  const { night, toggleNight } = useSettings();
  const [mix, setMix] = useState<Record<Key, number>>({ clouds: 1, stars: 0, moonbeams: 0, lantern: 0 });
  const change = (k: Key, d: number) => { setMix((m) => ({ ...m, [k]: Math.max(0, Math.min(5, m[k] + d)) })); blip(); };

  return (
    <section id="workshop" className="relative scroll-mt-20 px-4 py-24">
      <SectionHeading kicker="Interactive" title="The Dream Workshop">Mix tonight's dream. Pip will handle the wiring.</SectionHeading>
      <div className="reveal mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="paper rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Ingredients</h3>
            <button onClick={() => setMix({ clouds: 0, stars: 0, moonbeams: 0, lantern: 0 })} className="chip"><RotateCcw size={12} /> Empty jar</button>
          </div>
          <ul className="mt-5 space-y-3">
            {INGREDIENTS.map((i) => (
              <li key={i.key} className="flex items-center gap-3 rounded-2xl bg-paper p-3">
                <span aria-hidden className="text-2xl">{i.icon}</span>
                <span className="font-display">{i.label}</span>
                <div className="ml-auto flex items-center gap-2">
                  <button onClick={() => change(i.key, -1)} disabled={!mix[i.key]} aria-label={`Remove ${i.label}`} className="grid h-8 w-8 place-items-center rounded-full border-2 border-foreground disabled:opacity-30"><Minus size={14} /></button>
                  <span className="w-5 text-center font-display text-lg" aria-label={`${mix[i.key]} ${i.label}`}>{mix[i.key]}</span>
                  <button onClick={() => change(i.key, 1)} disabled={mix[i.key] >= 5} aria-label={`Add ${i.label}`} className="grid h-8 w-8 place-items-center rounded-full border-2 border-foreground bg-primary text-primary-foreground disabled:opacity-30"><Plus size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={toggleNight} aria-pressed={night} className="btn-ghost-dream mt-6 w-full justify-center">
            {night ? "☀️ Switch the whole site to day" : "🌙 Switch the whole site to night"}
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div aria-hidden className="paper relative aspect-[4/3] overflow-hidden rounded-[2rem] transition-colors duration-700" style={{ background: night ? "linear-gradient(var(--sky-top), var(--background))" : "linear-gradient(var(--sky-top), var(--cloud))" }}>
            <span className="absolute right-6 top-6 h-14 w-14 rounded-full bg-moon shadow-[0_0_40px_var(--glow)]" />
            {Array.from({ length: mix.clouds }, (_, k) => <Cloud key={`c${k}`} className="animate-pop animate-drift absolute w-28" style={{ left: `${(k * 19) % 75}%`, top: `${20 + (k * 23) % 40}%` }} />)}
            {Array.from({ length: mix.stars * 3 }, (_, k) => <Star key={`s${k}`} size={10 + (k % 3) * 5} className="animate-pop animate-twinkle absolute" style={{ left: `${(k * 37) % 92}%`, top: `${(k * 29) % 55}%`, animationDelay: `${k * 0.2}s` }} />)}
            {Array.from({ length: mix.moonbeams }, (_, k) => <span key={`m${k}`} className="animate-pop absolute top-0 h-full w-6 origin-top -rotate-12 opacity-40" style={{ left: `${20 + k * 14}%`, background: "linear-gradient(var(--moon), transparent)" }} />)}
            {mix.lantern > 0 && <span className="animate-pop absolute bottom-0 left-1/2 h-2/3 w-2/3 -translate-x-1/2 rounded-full" style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)", opacity: 0.4 + mix.lantern * 0.12 }} />}
            {mix.lantern > 0 && <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl">🏮</span>}
          </div>
          <p role="status" aria-live="polite" className="handwritten rounded-2xl border-2 border-dashed border-border bg-paper p-5 text-lg">
            {describeDream(mix, night)}
          </p>
        </div>
      </div>
    </section>
  );
}
