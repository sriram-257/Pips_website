import { useMemo } from "react";
import { useSettings } from "./settings";

export function Star({ size = 14, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={`star-shape inline-block ${className}`} style={{ width: size, height: size, ...style }} />;
}

export function Cloud({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg aria-hidden viewBox="0 0 200 90" className={className} style={style}>
      <path
        d="M30 80c-16 0-26-10-26-23s11-23 25-23c3-16 17-28 34-28 14 0 26 8 31 20 5-4 11-6 18-6 17 0 30 12 31 28 15 1 27 12 27 26 0 3-1 6-2 6z"
        fill="var(--cloud)" stroke="var(--foreground)" strokeOpacity=".18" strokeWidth="2"
      />
    </svg>
  );
}

function rand(seed: number) { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }

/** A field of decorative stars; reshuffles in chaos mode. */
export function StarField({ count = 18, seed = 1 }: { count?: number; seed?: number }) {
  const { chaos } = useSettings();
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: rand(seed + i) * 100, y: rand(seed + i * 3.1) * 100, s: 6 + rand(seed + i * 7.7) * 12, d: rand(i + seed) * 3,
  })), [count, seed]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((st, i) => {
        const dx = chaos ? (rand(i * 13 + seed) - 0.5) * 30 : 0;
        const dy = chaos ? (rand(i * 17 + seed) - 0.5) * 30 : 0;
        return (
          <span key={i} className="deco absolute" style={{ left: `${st.x}%`, top: `${st.y}%`, transform: `translate(${dx}vw, ${dy}vh) rotate(${chaos ? i * 40 : 0}deg)` }}>
            <Star size={st.s} className="animate-twinkle" style={{ animationDelay: `${st.d}s` }} />
          </span>
        );
      })}
    </div>
  );
}

export function SectionHeading({ kicker, title, children }: { kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="reveal mx-auto mb-12 max-w-2xl text-center">
      <span className="chip"><Star size={10} /> {kicker}</span>
      <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-lg text-muted-foreground">{children}</p>}
    </div>
  );
}
