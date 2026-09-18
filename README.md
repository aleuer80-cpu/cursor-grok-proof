# TEST REPO

Proof site for the GitHub → Vercel → Neon path shared by Cursor and Grok Bot.

**Status 2026-09-18:** GitHub **HIT** · Vercel **HIT** · Neon **MISS** (`DATABASE_URL` missing). This agent could not attach Neon from the cloud environment (Vercel MCP 403 on the personal Hobby account, Vercel CLI not logged in, marketplace `vercel install neon` required a new login and was aborted, no Neon API key). Do not log in with Google/GitHub again.

- GitHub: https://github.com/aleuer80-cpu/cursor-grok-proof (public)
- Production (user-confirmed HIT): https://cursor-grok-proof-4ee6m7vlv-aleuer80-cpu.vercel.app (SHA `7945c51`, vercel[bot] success)
- Later GitHub deploy: https://cursor-grok-proof-qlbqq63ub-aleuer80-cpu.vercel.app (SHA `630de1c`, vercel[bot] success)
- Homepage copy: **TEST REPO**
- One dropdown value: **Tested and Approved**
- Neon table: `approvals` (`id`, `phrase`, `source`, `created_at`)
- Source: `web` vs `grok-bot` via `/?source=grok-bot`

The homepage badges actually probe each hop: GitHub API, Vercel env, Neon `COUNT(*)`. Local `.data/approvals.json` is preview-only and is **not** Neon.

## Remaining step (Neon)

On the existing Vercel project: **Storage tab → Neon (Marketplace) → it injects `DATABASE_URL`**. Then redeploy and submit **Tested and Approved** once on the production URL.

## Dual-platform playbook (Cursor and Grok Bot)

Reuse the same GitHub PAT in both tools. Do not mint a new PAT if the current one already creates and pushes.

| Tool | How to create a repo | How it deploys |
| --- | --- | --- |
| Cursor | GitHub MCP `create_repository` + `push_files` | Push to `aleuer80-cpu`. Vercel auto-deploys. |
| Grok Bot | Its GitHub plugin, pointed at the **same** repo | Same push → same Vercel project. |

Cursor GitHub MCP needs a fine-grained PAT with **Administration:write** + **Contents:write**, or a classic repo-scoped token. That is the token to reuse in Grok Bot.

Vercel / Neon / Notion plugins are **separate auth lists** in each tool. Installing GitHub in Cursor and Grok Bot does **not** install Vercel, Neon, or Notion.

Neon is attached once on the Vercel project (Storage / Marketplace) so `DATABASE_URL` is shared.

### Grok Bot proof (after Neon)

1. Open the production URL with `/?source=grok-bot`
2. Submit **Tested and Approved**.
3. Confirm a Neon hit and a new `source = grok-bot` row.

Optional: submit once from Cursor without the query (`web`). Two Neon rows means both platforms hit the same database.

## Still blocked

- Vercel MCP **403** on personal Hobby `aleuer80-cpu` (empty teams, cannot list/get the project, cannot mint a shareable URL). Dashboard import already worked.
- This is a new project. For a Cursor-visible named repo, use the **Create repo** pill. GitHub is the deploy source of truth.
- Neon until the Storage tab step above.

## Local

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:43217. Submits work immediately in this preview (`.data/approvals.json`). With `DATABASE_URL` they go to Neon instead.

## App stack

Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, `@neondatabase/serverless`, native `<select>`.
