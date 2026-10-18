import { useMemo } from "react";
import { useSettings } from "./settings";

export function Star({ size = 14, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={`star-shape inline-block ${className}`} style={{ width: `${size}px`, height: `${size}px`, ...style }} />;
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
export function StarField({ count = 18, seed = 1, className = "" }: { count?: number; seed?: number; className?: string }) {
  const { chaos } = useSettings();
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: Math.round(rand(seed + i) * 1000) / 10, y: Math.round(rand(seed + i * 3.1) * 1000) / 10, s: Math.round(6 + rand(seed + i * 7.7) * 12), d: Math.round(rand(i + seed) * 30) / 10,
  })), [count, seed]);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {stars.map((st, i) => {
        const cx = Math.round((rand(i * 13 + seed) - 0.5) * 30);
        const cy = Math.round((rand(i * 17 + seed) - 0.5) * 30);
        return (
          <span key={i} className={`deco deco-star absolute ${chaos ? "is-chaos" : ""}`}
            style={{ left: `${st.x}%`, top: `${st.y}%`, ["--cx" as string]: cx, ["--cy" as string]: cy, ["--cr" as string]: `${i * 40}deg` } as React.CSSProperties}>
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
