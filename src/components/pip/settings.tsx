import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { blip, setSoundEnabled } from "@/lib/sound";

type Settings = {
  night: boolean;
  toggleNight: () => void;
  sound: boolean;
  toggleSound: () => void;
  chaos: boolean;
  toggleChaos: () => void;
};

const Ctx = createContext<Settings | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [night, setNight] = useState(false);
  const [sound, setSound] = useState(false);
  const [chaos, setChaos] = useState(false);

  useEffect(() => {
    setNight(document.documentElement.classList.contains("dark"));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("chaos", chaos);
  }, [chaos]);

  const toggleNight = useCallback(() => {
    setNight((n) => {
      const next = !n;
      document.documentElement.classList.toggle("dark", next);
      try { localStorage.setItem("pip-theme", next ? "night" : "day"); } catch { /* ignore */ }
      return next;
    });
    blip("sparkle");
  }, []);

  const toggleSound = useCallback(() => {
    setSound((s) => {
      setSoundEnabled(!s);
      if (!s) setTimeout(() => blip("success"), 30);
      return !s;
    });
  }, []);

  const toggleChaos = useCallback(() => { setChaos((c) => !c); blip("sparkle"); }, []);

  return (
    <Ctx.Provider value={{ night, toggleNight, sound, toggleSound, chaos, toggleChaos }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSettings outside provider");
  return v;
}

/**
 * Fades .reveal elements in as they enter the viewport.
 * Uses a data attribute (not a class) so React re-renders that rewrite
 * className never hide content again. Fails open: content is visible
 * without JS, if observers are missing, or after a safety timeout.
 */
export function useReveal() {
  useEffect(() => {
    const root = document.documentElement;
    const show = (el: Element) => el.setAttribute("data-revealed", "");
    const all = () => document.querySelectorAll(".reveal").forEach(show);
    if (!("IntersectionObserver" in window)) { all(); return; }
    let io: IntersectionObserver;
    try {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
      }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
      document.querySelectorAll(".reveal:not([data-revealed])").forEach((el) => io.observe(el));
    } catch { all(); return; }
    root.classList.add("js-reveal");
    const safety = setTimeout(all, 4000);
    return () => { io.disconnect(); clearTimeout(safety); root.classList.remove("js-reveal"); };
  }, []);
}
