<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dual-platform ship path (Cursor and Grok Bot)

The standing **Ship Owner** agent owns this chain. Aaron designs. Ship Owner finishes to Neon. Do not send Aaron to the Vercel Storage tab, dashboards, PAT regeneration, or extra OAuth. See `.cursor/rules/ship-owner.mdc`.

When he says **new app** in either tool, complete all five hops:

1. **Code** the app.
2. **GitHub** repo + push (`create_repository` / `push_files`, or Grok Bot GitHub plugin on `aleuer80-cpu`). Reuse the current PAT.
3. **Notion intelligence** — a real page or Shipped Apps row for that app, not a chat note.
4. **Vercel** project from that git repo → production URL (`VERCEL_TOKEN` REST if Hobby MCP 403s).
5. **Neon** project via MCP/API → set `DATABASE_URL` on Production + Preview → redeploy → prove a write (`npm run attach:neon`).

```bash
node scripts/zero-touch-attach.mjs --vercel-project=cursor-grok-proof --neon-project=cursor-grok-proof --github=aleuer80-cpu/cursor-grok-proof
```

Never dump `NEON_API_KEY`, `VERCEL_TOKEN`, or `DATABASE_URL` into git or Notion.

# Ongoing backend growth (after day one)

Day one (sibling agents) ends when GitHub, Vercel, Notion intelligence, and Neon storage (`DATABASE_URL`) exist. After that, the backend must grow with the app autonomously.

When Aaron asks for a feature in **Cursor or Grok Bot**, do all of this without him:

1. Change app code (UI + server).
2. Evolve Neon: add `src/db/migrations/00N_<name>.sql`, register it in `src/db/migrations.ts`, apply it against `DATABASE_URL` via Neon MCP/API (or `applyMigrations()`). Not SQL in the Neon console. Not the Vercel Storage tab.
3. Evolve API / server actions / route handlers to match.
4. Keep Notion intelligence current (what shipped, schema, env) on the dual-platform playbook.
5. Commit, push to GitHub, let Vercel redeploy. Neon data/schema stays in sync with production.
6. Never require Aaron to push, migrate, or click Storage.

Proof today: `001_approvals` + **Tested and Approved** write. Future features add tables the same way. Same behavior if the request starts in Grok Bot or Cursor.
