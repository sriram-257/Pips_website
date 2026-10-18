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
- Guestbook and visit counter read/write Lovable Cloud directly from the browser client; anti-spam and timestamps are enforced by a DB trigger, and the counter table is only reachable via security-definer RPCs.
