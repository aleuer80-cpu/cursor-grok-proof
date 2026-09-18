# TEST REPO

Proof site for the GitHub → Vercel → Neon path shared by Cursor and Grok Bot.

**Status 2026-09-18 (user-confirmed):** GitHub HIT · Vercel HIT · Neon MISS (`DATABASE_URL` missing).

- GitHub SoT: https://github.com/aleuer80-cpu/cursor-grok-proof (public; last push ~4:24 AM)
- Production: https://cursor-grok-proof-4ee6m7vlv-aleuer80-cpu.vercel.app (SHA `7945c51`, vercel[bot] GitHub deploy success)
- Homepage copy: **TEST REPO**
- One dropdown value: **Tested and Approved**
- Neon table: `approvals` (`id`, `phrase`, `source`, `created_at`)
- Source: `web` vs `grok-bot` via `/?source=grok-bot`

The homepage badges actually probe each hop: GitHub API, Vercel env, Neon `COUNT(*)`.

## Remaining step: Neon via Vercel Storage tab

Do this on the **already-imported** Vercel project. Do not log in with Google/GitHub again.

1. Vercel project → **Storage** / Marketplace → add **Neon**.
2. Confirm `DATABASE_URL` is injected for **Production** and **Preview**.
3. Redeploy.
4. Submit **Tested and Approved** once on the production URL so the row lands in Postgres.

Local `.data/approvals.json` holds preview-only rows that are **not** Neon. They do not migrate.

## Dual-platform playbook (Cursor and Grok Bot)

Same GitHub PAT in **both** tools. Do not mint a new PAT if the current one already creates and pushes.

| Tool | How to create a repo | How it deploys |
| --- | --- | --- |
| Cursor | GitHub MCP `create_repository` + `push_files` | Push to `aleuer80-cpu` (or a future repo). Vercel auto-deploys. |
| Grok Bot | Its GitHub plugin, pointed at the **same** repo | Same push → same Vercel project. |

Cursor GitHub MCP needs a fine-grained PAT with **Administration:write** + **Contents:write**, or a classic repo-scoped token. That is the token to reuse in Grok Bot.

Vercel / Neon / Notion plugins are **separate auth lists** in each tool. Installing GitHub in Cursor and Grok Bot does **not** install Vercel, Neon, or Notion.

Neon is attached once on the Vercel project (Storage / Marketplace) so `DATABASE_URL` is shared. Notion is installed separately in both tools.

### Grok Bot proof (after Neon)

1. Open https://cursor-grok-proof-4ee6m7vlv-aleuer80-cpu.vercel.app/?source=grok-bot
2. Submit **Tested and Approved**.
3. Confirm a Neon hit and a new `source = grok-bot` row.

Optional: submit once from Cursor without the query (`web`). Two Neon rows means both platforms hit the same database.

## Still blocked

- Vercel MCP **403** on personal Hobby `aleuer80-cpu`. Dashboard import already worked.
- Cursor Origin named-repo create is not scoped. For a Cursor-visible new project, use the **Create repo** pill. GitHub is the deploy SoT; Origin is optional.
- Neon until the Storage tab step above.

## Local

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:43217. Submits work immediately in this preview (`.data/approvals.json`). With `DATABASE_URL` they go to Neon instead.

## App stack

Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, `@neondatabase/serverless`, native `<select>`.
