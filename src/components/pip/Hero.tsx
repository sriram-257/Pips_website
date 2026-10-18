import { Moon, Sun, Volume2, VolumeX, Sparkles } from "lucide-react";
import avatar from "@/assets/pip_avatar_cloud.jpg.asset.json";
import { Cloud, Star, StarField } from "./Decor";
import { useSettings } from "./settings";
import { blip } from "@/lib/sound";

const NAV = [
  ["Pip", "#meet"], ["Dreams", "#projects"], ["Story", "#story"], ["Workshop", "#workshop"], ["Guestbook", "#guestbook"],
] as const;

export function TopBar() {
  const { night, toggleNight, sound, toggleSound, chaos, toggleChaos } = useSettings();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-dashed border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-semibold">
          <Star size={18} className="animate-twinkle" />
          <span className="whitespace-nowrap text-base sm:text-lg">Midnight Nursery</span>
        </a>
        <nav aria-label="Sections" className="ml-6 hidden gap-5 font-display text-sm lg:flex">
          {NAV.map(([l, h]) => <a key={h} href={h} className="hover:text-primary">{l}</a>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={toggleChaos} aria-pressed={chaos} aria-label="A little dream chaos" className={`chip min-h-9 ${chaos ? "bg-accent" : ""}`} title="A little dream chaos">
            <Sparkles size={14} /><span className="hidden lg:inline">A little dream chaos</span>
          </button>
          <button onClick={toggleSound} aria-pressed={sound} aria-label={sound ? "Mute sounds" : "Turn sounds on"} className={`chip min-h-9 ${sound ? "bg-accent" : ""}`}>
            {sound ? <Volume2 size={14} /> : <VolumeX size={14} />}<span className="hidden lg:inline">{sound ? "Sound on" : "Muted"}</span>
          </button>
          <button onClick={toggleNight} aria-pressed={night} aria-label={night ? "Switch to day" : "Switch to night"} className="chip min-h-9">
            {night ? <Sun size={14} /> : <Moon size={14} />}<span className="hidden lg:inline">{night ? "Day" : "Night"}</span>
          </button>
        </div>
      </div>
      <nav aria-label="Sections" className="flex gap-4 overflow-x-auto px-4 pb-2 font-display text-sm lg:hidden">
        {NAV.map(([l, h]) => <a key={h} href={h} className="shrink-0 rounded-full px-2 py-1 hover:text-primary">{l}</a>)}
      </nav>
    </header>
  );
}

export function Hero({ onMoon }: { onMoon: () => void }) {
  const { chaos } = useSettings();
  return (
    <section id="top" className="relative overflow-hidden px-4 pb-24 pt-10 sm:pt-16">
      <StarField count={10} seed={3} className="opacity-60" />
      <Cloud className="deco deco-cloud animate-drift absolute -left-10 top-24 w-48 opacity-80 sm:w-72" />
      <Cloud className="deco deco-cloud animate-drift absolute -right-16 bottom-4 w-40 opacity-70 sm:w-80" style={{ animationDelay: "-6s" }} />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr]">
        <div className="order-2 text-center md:order-1 md:text-left">
          <span className="chip">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            Dream workshop open
          </span>
          <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
            The stars are still <span className="text-primary">under construction.</span>
          </h1>
          <p className="handwritten mt-6 text-xl sm:text-2xl">“I build the dreams you fall asleep inside.”</p>
          <p className="mt-2 text-muted-foreground">— Pip, Junior Dream Engineer at the Midnight Nursery</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <a href="#projects" onClick={() => blip()} className="btn-dream">Explore my little universe →</a>
            <a href="#meet" onClick={() => blip()} className="btn-ghost-dream">Meet the dream engineer</a>
          </div>
          <p className="mt-8 inline-block max-w-full rotate-[-1deg] rounded-lg border-2 border-dashed border-border bg-paper px-4 py-2 text-sm">
            Currently repairing a dream about <b>flying toast</b>.
          </p>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-sm md:order-2 md:max-w-md">
          <div aria-hidden className="dotted-orbit animate-spin-slow absolute -inset-6 hidden opacity-70 sm:block" />
          <button
            onClick={onMoon}
            aria-label="A sleepy moon (it seems to like being tapped)"
            className={`deco absolute -right-1 -top-4 z-10 grid h-16 w-16 sm:-right-4 sm:-top-6 place-items-center rounded-full bg-moon text-3xl shadow-[0_0_40px_var(--glow)] animate-float sm:h-24 sm:w-24 ${chaos ? "rotate-45" : ""}`}
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="var(--moon-foreground)" opacity=".75" /></svg>
          </button>
          <figure className="portrait-frame animate-float relative aspect-[896/1090] rounded-[45%_45%_2rem_2rem]">
            <img src={avatar.url} alt="Pip the Skull Baby waving from a fluffy dream cloud" className="h-full w-full object-cover" width={896} height={1090} />
          </figure>
          <span className="handwritten absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper px-4 py-1 text-sm shadow">fig. 1 — Pip, on shift</span>
        </div>
      </div>
    </section>
  );
}
