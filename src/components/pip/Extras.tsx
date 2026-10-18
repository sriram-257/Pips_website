import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import avatar from "@/assets/pip_avatar_cloud.jpg.asset.json";
import { Star } from "./Decor";
import { blip } from "@/lib/sound";

/** Sparkle cursor trail — fine pointers only, no reduced motion, capped particles. */
export function SparkleTrail() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !layer.current) return;
    let last = 0;
    const el = layer.current;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 40) return;
      last = now;
      if (el.childElementCount > 24) el.firstElementChild?.remove();
      const s = document.createElement("span");
      s.className = "star-shape absolute";
      const size = 6 + Math.random() * 8;
      Object.assign(s.style, { left: `${e.clientX}px`, top: `${e.clientY}px`, width: `${size}px`, height: `${size}px`, animation: "sparkle-fade .8s ease-out forwards" });
      el.appendChild(s);
      setTimeout(() => s.remove(), 850);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); el.replaceChildren(); };
  }, []);
  return <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-50" />;
}

/** Odometer — a local demo counter (visits in this browser). */
export function Odometer() {
  const [n, setN] = useState(0);
  useEffect(() => {
    let v = 1;
    try { v = Number(localStorage.getItem("pip-visits") || "0") + 1; localStorage.setItem("pip-visits", String(v)); } catch { /* ignore */ }
    const t = setTimeout(() => setN(v + 1200), 300);
    return () => clearTimeout(t);
  }, []);
  const digits = String(n).padStart(6, "0").split("");
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <p className="font-display text-sm">Dreamers who stopped by</p>
      <div role="img" aria-label={`Counter showing ${n}`} className="flex gap-1 rounded-xl border-2 border-foreground bg-foreground p-1.5">
        {digits.map((d, i) => (
          <span key={i} className="relative h-9 w-7 overflow-hidden rounded-md bg-paper font-display text-xl">
            <span className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[1400ms] ease-out" style={{ transform: `translateY(-${Number(d) * 10}%)`, transitionDelay: `${i * 80}ms` }}>
              {Array.from({ length: 10 }, (_, k) => <span key={k} className="grid h-9 place-items-center">{k}</span>)}
            </span>
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Local demo counter — counts your visits from this browser (plus Pip's 1,200 imaginary friends).</p>
    </div>
  );
}

export function StarBurst({ trigger }: { trigger: number }) {
  if (!trigger) return null;
  return (
    <div key={trigger} aria-hidden className="pointer-events-none fixed left-1/2 top-1/2 z-[60]">
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <Star key={i} size={16} className="absolute" style={{ ["--dx" as string]: `${Math.cos(a) * 220}px`, ["--dy" as string]: `${Math.sin(a) * 220}px`, animation: "burst 1.1s ease-out forwards" } as React.CSSProperties} />;
      })}
    </div>
  );
}

export function SecretJournal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] grid place-items-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="journal-title" onClick={(e) => e.stopPropagation()} className="paper animate-pop relative max-w-md rounded-[2rem] p-8 text-center">
        <button ref={closeRef} onClick={() => { onClose(); blip(); }} aria-label="Close Pip's dream journal" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border-2 border-foreground"><X size={16} /></button>
        <span className="chip">Top secret · page 1</span>
        <h3 id="journal-title" className="mt-4 text-3xl font-semibold">Pip's Dream Journal</h3>
        <img src={avatar.url} alt="" className="mx-auto mt-5 h-40 w-40 rounded-full border-2 border-foreground object-cover" />
        <p className="handwritten mt-5 text-lg leading-relaxed">“Psst… even dream engineers need a dream of their own. I wish for a tiny garden where every star grows into a flower.”</p>
        <p className="mt-4 text-xs text-muted-foreground">You woke the moon. It will remember you fondly.</p>
      </div>
    </div>
  );
}
