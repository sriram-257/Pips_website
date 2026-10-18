// Tiny Web Audio synth. Everything is generated — no audio files.
let ctx: AudioContext | null = null;
let enabled = false;
let lastBlip = 0;
let lullabyTimer: ReturnType<typeof setTimeout> | null = null;
let lullabyGain: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export const audioSupported = () =>
  typeof window !== "undefined" && !!(window.AudioContext || (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext);

export function setSoundEnabled(on: boolean) {
  enabled = on;
  if (!on) stopLullaby();
}

function tone(c: AudioContext, dest: AudioNode, freq: number, start: number, dur: number, vol = 0.06, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(start + dur + 0.05);
}

/** Short UI chime. Silently ignored when muted or throttled. */
export function blip(kind: "tap" | "sparkle" | "success" = "tap") {
  if (!enabled) return;
  const now = performance.now();
  if (now - lastBlip < 90) return;
  lastBlip = now;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  if (kind === "tap") tone(c, c.destination, 880, t, 0.15, 0.04, "triangle");
  if (kind === "sparkle") { tone(c, c.destination, 1318, t, 0.25, 0.035); tone(c, c.destination, 1760, t + 0.07, 0.3, 0.03); }
  if (kind === "success") [784, 988, 1175, 1568].forEach((f, i) => tone(c, c.destination, f, t + i * 0.09, 0.4, 0.035));
}

const MELODY = [659, 784, 880, 784, 659, 587, 523, 587, 659, 523, 587, 494, 523];

/** Plays a looping music-box lullaby. Returns false if audio is unavailable. */
export function startLullaby(): boolean {
  const c = getCtx();
  if (!c) return false;
  stopLullaby();
  lullabyGain = c.createGain();
  lullabyGain.gain.value = 1;
  lullabyGain.connect(c.destination);
  const loop = () => {
    if (!lullabyGain) return;
    const t = c.currentTime + 0.05;
    MELODY.forEach((f, i) => {
      tone(c, lullabyGain!, f, t + i * 0.42, 1.2, 0.05, "sine");
      tone(c, lullabyGain!, f * 2, t + i * 0.42, 0.6, 0.012, "triangle");
    });
    lullabyTimer = setTimeout(loop, MELODY.length * 420 + 600);
  };
  loop();
  return true;
}

export function stopLullaby() {
  if (lullabyTimer) clearTimeout(lullabyTimer);
  lullabyTimer = null;
  if (lullabyGain && ctx) {
    lullabyGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    const g = lullabyGain;
    setTimeout(() => g.disconnect(), 400);
  }
  lullabyGain = null;
}
