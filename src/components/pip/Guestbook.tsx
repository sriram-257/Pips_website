import { useEffect, useState } from "react";
import { SectionHeading, Star } from "./Decor";
import { blip } from "@/lib/sound";

type Entry = { id: string; name: string; wish: string; at: number };
const KEY = "pip-guestbook";
export const NAME_MAX = 24;
export const WISH_MAX = 140;

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

export function Guestbook() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState("");

  useEffect(() => {
    try { const raw = sessionStorage.getItem(KEY); if (raw) setEntries(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEntry(name, wish);
    setError(err); setOk("");
    if (err) return;
    const next = [{ id: crypto.randomUUID(), name: name.trim(), wish: wish.trim(), at: Date.now() }, ...entries].slice(0, 30);
    setEntries(next);
    try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setOk(`Thank you, ${name.trim()}! Pip pinned your wish to the starboard.`);
    setName(""); setWish("");
    blip("success");
  };

  return (
    <section id="guestbook" className="relative px-4 py-24">
      <SectionHeading kicker="Sign in, sleepyhead" title="The Midnight Guestbook">Leave a nickname and a dream wish.</SectionHeading>
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1fr_1.2fr]">
        <form onSubmit={submit} noValidate className="reveal paper h-fit rounded-[2rem] p-6 sm:p-8">
          <label className="block font-display" htmlFor="gb-name">Nickname</label>
          <input id="gb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX + 10}
            className="mt-2 w-full rounded-xl border-2 border-input bg-background px-4 py-3" placeholder="Sleepy Otter" />
          <p className="mt-1 text-right text-xs text-muted-foreground">{name.length}/{NAME_MAX}</p>
          <label className="mt-2 block font-display" htmlFor="gb-wish">Your dream wish</label>
          <textarea id="gb-wish" value={wish} onChange={(e) => setWish(e.target.value)} rows={3} maxLength={WISH_MAX + 20}
            className="mt-2 w-full resize-none rounded-xl border-2 border-input bg-background px-4 py-3" placeholder="A dream where…" />
          <p className={`mt-1 text-right text-xs ${wish.length > WISH_MAX ? "text-destructive" : "text-muted-foreground"}`}>{wish.length}/{WISH_MAX}</p>
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          {ok && <p role="status" className="animate-pop mt-2 text-sm font-semibold text-primary">{ok}</p>}
          <button type="submit" className="btn-dream mt-4 w-full justify-center">Pin my wish ✨</button>
          <p className="mt-3 text-xs text-muted-foreground">Your notes stay in this browser tab only — they aren't sent anywhere or shown to other visitors.</p>
        </form>

        <div className="reveal space-y-6">
          <div>
            <h3 className="font-display text-lg">Your notes</h3>
            {entries.length === 0 ? (
              <p className="mt-2 rounded-2xl border-2 border-dashed border-border p-5 text-muted-foreground">No notes yet. The first page is all yours.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {entries.map((e) => (
                  <li key={e.id} className="paper animate-pop rounded-2xl p-4">
                    <p className="handwritten text-lg">“{e.wish}”</p>
                    <p className="mt-1 font-display text-sm text-primary">— {e.name}</p>
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
