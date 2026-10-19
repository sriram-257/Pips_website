<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Pip site sections live in src/components/pip/; shared toggles (night/sound/chaos) go through settings.tsx context so every section reacts to one source of truth.
- Guestbook and visit counter go through public server functions in src/lib/public-data.functions.ts (server-side publishable client, RLS as anon), never the browser Supabase client — the browser client depends on build-time env and auth-storage startup, which broke the published site. Anti-spam/timestamps are enforced by a DB trigger; the counter table is only reachable via security-definer RPCs.
- src/start.ts registers no bearer-attaching functionMiddleware: the app has no sign-in, and the attacher blocked public server calls on browser auth startup. Re-add one only if authenticated server functions are introduced.
