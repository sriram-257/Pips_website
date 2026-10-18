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
    document.documentElement.classList.add("js-reveal");
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

/** Adds .is-in to .reveal elements once visible. Content is visible without JS. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
}
