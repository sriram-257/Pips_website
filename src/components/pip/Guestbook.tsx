import { useCallback, useEffect, useState } from "react";
import { SectionHeading, Star, StarField } from "./Decor";
import { blip } from "@/lib/sound";
import { supabase } from "@/integrations/supabase/client";

type Entry = { id: string; nickname: string; message: string; created_at: string };
export const NAME_MAX = 24;
export const WISH_MAX = 140;
const COOLDOWN_MS = 30_000;

const SAMPLES = [
  { name: "Moth #42", wish: "A dream where I'm finally allowed to touch the lamp." },
  { name: "Grandma Juniper", wish: "One more picnic by the lake, with the good jam." },
  { name: "Theo, age 6", wish: "A dinosaur who is also a librarian." },
];

export function validateEntry(name: string, wish: string): string | null {
  if (!name.trim()) return "Pip needs a nickname to sign the book.";
  if (name.trim().length > NAME_MAX) return `Nicknames can be up to ${NAME_MAX} characters.`;
  if (wish.trim().length < 3) return "Write a dream wish (at least 3 characters).";
  if (wish.trim().length > WISH_MAX) return `Wishes can be up to ${WISH_MAX} characters.`;
  return null;
}

/** Turns database guard errors into friendly copy. */
export function friendlyError(msg: string): string {
  if (msg.includes("guestbook_slow_down")) return "That nickname just signed — please wait 30 seconds.";
  if (msg.includes("guestbook_duplicate")) return "Someone already pinned that exact wish. Try your own words!";
  if (msg.includes("guestbook_busy")) return "The guestbook is very busy. Try again in a minute.";
  return "Pip couldn't reach the guestbook. Please try again.";
}

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState("");

  const load = useCallback(async () => {
    setStatus("loading");
    const { data, error: e } = await supabase
      .from("guestbook_entries").select("id, nickname, message, created_at")
      .order("created_at", { ascending: false }).limit(30);
    if (e) { setStatus("error"); return; }
    setEntries(data ?? []); setStatus("ready");
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk("");
    if (trap) return; // honeypot: bots fill hidden fields
    const err = validateEntry(name, wish);
    if (!err && Date.now() - lastSent < COOLDOWN_MS) { setError("Thanks! Please wait a few seconds before pinning another wish."); return; }
    setError(err);
    if (err) return;
    setSending(true);
    const { data, error: dbErr } = await supabase
      .from("guestbook_entries").insert({ nickname: name.trim(), message: wish.trim() })
      .select("id, nickname, message, created_at").single();
    setSending(false);
    if (dbErr || !data) { setError(friendlyError(dbErr?.message ?? "")); return; }
    setEntries((prev) => [data, ...prev.filter((p) => p.id !== data.id)].slice(0, 30));
    setLastSent(Date.now());
    setOk(`Thank you, ${data.nickname}! Your wish is now on the public starboard.`);
    setName(""); setWish("");
    blip("success");
  };

  return (
    <section id="guestbook" className="relative isolate px-4 py-24">
      <StarField count={14} seed={51} className="chaos-only -z-10" />
      <SectionHeading kicker="Live public wall" title="The Midnight Guestbook">Leave a nickname and a dream wish for every visitor to see.</SectionHeading>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1.2fr]">
        <form onSubmit={submit} noValidate className="reveal paper h-fit rounded-[2rem] p-6 sm:p-8">
          <label className="block font-display" htmlFor="gb-name">Nickname</label>
          <input id="gb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX + 10} autoComplete="nickname"
            className="mt-2 w-full rounded-xl border-2 border-input bg-background px-4 py-3" placeholder="Sleepy Otter" />
          <p className="mt-1 text-right text-xs text-muted-foreground">{name.length}/{NAME_MAX}</p>
          <label className="mt-2 block font-display" htmlFor="gb-wish">Your dream wish</label>
          <textarea id="gb-wish" value={wish} onChange={(e) => setWish(e.target.value)} rows={3} maxLength={WISH_MAX + 20}
            className="mt-2 w-full resize-none rounded-xl border-2 border-input bg-background px-4 py-3" placeholder="A dream where…" />
          <p className={`mt-1 text-right text-xs ${wish.length > WISH_MAX ? "text-destructive" : "text-muted-foreground"}`}>{wish.length}/{WISH_MAX}</p>
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="gb-website">Website</label>
            <input id="gb-website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          {ok && <p role="status" className="animate-pop mt-2 text-sm font-semibold text-primary">{ok}</p>}
          <button type="submit" disabled={sending} className="btn-dream mt-4 w-full justify-center disabled:opacity-60">{sending ? "Pinning…" : "Pin my wish ✨"}</button>
          <p className="mt-3 text-xs text-muted-foreground">Public: your nickname and wish are saved and shown to everyone who visits. Please don't share personal details.</p>
        </form>

        <div className="reveal space-y-6">
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg">Recent wishes <span className="chip">Live</span></h3>
            {status === "loading" && entries.length === 0 && <p className="mt-2 rounded-2xl border-2 border-dashed border-border p-5 text-muted-foreground" role="status">Pip is fetching the starboard…</p>}
            {status === "error" && (
              <div className="mt-2 rounded-2xl border-2 border-dashed border-border p-5" role="alert">
                <p className="text-muted-foreground">The starboard is out of reach right now.</p>
                <button type="button" onClick={() => void load()} className="btn-ghost-dream mt-3">Try again</button>
              </div>
            )}
            {status === "ready" && entries.length === 0 && <p className="mt-2 rounded-2xl border-2 border-dashed border-border p-5 text-muted-foreground">No wishes yet. Be the very first dreamer!</p>}
            {entries.length > 0 && (
              <ul className="mt-2 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                {entries.map((e) => (
                  <li key={e.id} className="paper animate-pop rounded-2xl p-4">
                    <p className="handwritten break-words text-lg">“{e.message}”</p>
                    <p className="mt-1 font-display text-sm text-primary">— {e.nickname} <span className="text-xs text-muted-foreground">· {timeAgo(e.created_at)}</span></p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="flex items-center gap-2 font-display text-lg">Pinned by Pip <span className="chip">Example notes</span></h3>
            <ul className="mt-2 grid gap-3 sm:grid-cols-3">
              {SAMPLES.map((s, i) => (
                <li key={s.name} className="rounded-2xl bg-paper p-4" style={{ transform: `rotate(${(i - 1) * 2}deg)` }}>
                  <Star size={12} />
                  <p className="handwritten mt-2">“{s.wish}”</p>
                  <p className="mt-2 font-display text-xs text-muted-foreground">— {s.name}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
