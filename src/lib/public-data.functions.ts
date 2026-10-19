import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Public guestbook + visit counter, served from the app's own server.
 * The browser never needs build-time backend settings, so a build that lacks
 * them can no longer leave the guestbook/counter stuck. RLS still applies
 * (publishable key, anonymous role); anti-spam stays in the DB trigger.
 */
export type Wish = { id: string; nickname: string; message: string; created_at: string };
export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h, signal: init?.signal ?? AbortSignal.timeout(10_000) });
      },
    },
  });
}

const NOT_CONFIGURED = "backend_not_configured";

export const listWishes = createServerFn({ method: "GET" }).handler(async (): Promise<Result<Wish[]>> => {
  const db = publicClient();
  if (!db) return { ok: false, error: NOT_CONFIGURED };
  const { data, error } = await db
    .from("guestbook_entries").select("id, nickname, message, created_at")
    .order("created_at", { ascending: false }).limit(30);
  if (error) { console.error("listWishes", error.message); return { ok: false, error: error.message }; }
  return { ok: true, data: data ?? [] };
});

export const pinWish = createServerFn({ method: "POST" })
  .inputValidator((input: { nickname: string; message: string }) => {
    const nickname = String(input?.nickname ?? "").trim();
    const message = String(input?.message ?? "").trim();
    if (nickname.length < 1 || nickname.length > 24) throw new Error("invalid_nickname");
    if (message.length < 3 || message.length > 140) throw new Error("invalid_message");
    return { nickname, message };
  })
  .handler(async ({ data }): Promise<Result<Wish>> => {
    const db = publicClient();
    if (!db) return { ok: false, error: NOT_CONFIGURED };
    const { data: row, error } = await db
      .from("guestbook_entries").insert(data)
      .select("id, nickname, message, created_at").single();
    if (error) { console.error("pinWish", error.message); return { ok: false, error: error.message }; }
    if (!row) return { ok: false, error: "no_row_returned" };
    return { ok: true, data: row };
  });

/** register=true counts this visit (once per browser session, decided by the caller); false only reads. */
export const countVisit = createServerFn({ method: "POST" })
  .inputValidator((input: { register: boolean }) => ({ register: input?.register === true }))
  .handler(async ({ data }): Promise<Result<number>> => {
    const db = publicClient();
    if (!db) return { ok: false, error: NOT_CONFIGURED };
    const { data: n, error } = data.register ? await db.rpc("register_visit") : await db.rpc("get_visits");
    if (error || n == null) { console.error("countVisit", error?.message); return { ok: false, error: error?.message ?? "no_count" }; }
    return { ok: true, data: Number(n) };
  });
