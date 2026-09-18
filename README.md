# TEST REPO

Aaron designs. Agents ship. He never does this again.

When Aaron says **new app** in **Cursor or Grok Bot**, that platform takes the entire process to the finish line: code, GitHub repo, Notion intelligence, Vercel production URL, Neon `DATABASE_URL` with a proven write. Cursor-only or Grok-only is a fail. Storage-tab, dashboards, PAT regeneration, and Google/GitHub OAuth loops are fails.

**Proof status 2026-09-18:** GitHub **HIT** · Vercel **HIT** · Notion intelligence **HIT** · Neon **MISS** (`DATABASE_URL` missing in this session). No `NEON_API_KEY` or `VERCEL_TOKEN` in this VM; Vercel MCP 403 on Hobby. The next session that has those one-time secrets runs `npm run attach:neon` and finishes the write. Do not send Aaron through Storage, the Neon console, or extra logins.

- GitHub (deploy source of truth): https://github.com/aleuer80-cpu/cursor-grok-proof
- Production: https://cursor-grok-proof.vercel.app
- Playbook (do not duplicate): https://app.notion.com/p/3df103733b8f814b9ff1e6088b11be3d
- Shipped Apps (per-app intelligence): https://app.notion.com/p/73f70cad0229400c8bf627978c3de997
- Homepage copy: **TEST REPO**
- One dropdown value: **Tested and Approved**
- Neon table: `approvals` (`id`, `phrase`, `source`, `created_at`) — schema-as-code in `src/db/migrations/001_approvals.sql`
- Source: `web` vs `grok-bot` via `/?source=grok-bot`

Homepage badges probe GitHub API, Vercel env, and Neon `COUNT(*)`. Local `.data/approvals.json` is preview-only and is **not** Neon.

## 5-step chain (same steps, either tool)

Trigger: Aaron says **new app** in Cursor or Grok Bot.

| Step | What the agent creates | Cursor | Grok Bot |
| --- | --- | --- | --- |
| 1. Code | The app | This agent / Cloud Agent | Grok Bot coding |
| 2. GitHub repo | Public or private repo + push. Aaron does not git. | GitHub MCP `create_repository` + `push_files` | GitHub plugin on the **same** `aleuer80-cpu` account. Reuse the current PAT; do not mint a new one. |
| 3. Notion intelligence | A **real page or database row** for that app (design, hops, URLs). Not a chat note. | Notion MCP `create-pages` / `create-database` into **Shipped Apps** | Notion plugin, same Aaron Leuer Space |
| 4. Vercel | Project from that GitHub repo → production URL | `VERCEL_TOKEN` REST (`POST /v11/projects` + git) or Vercel MCP `create_git_project` if a team exists. Hobby MCP 403 is expected. | Vercel plugin, same Vercel account |
| 5. Neon | New Neon project → `DATABASE_URL` on Vercel Production **and** Preview → redeploy → prove a write | Neon MCP (`https://mcp.neon.tech/mcp`) or `NEON_API_KEY`, then `npm run attach:neon` | Neon Postgres plugin, then the same Vercel env write |

After step 5, submit **Tested and Approved** on production. Grok Bot proof uses `/?source=grok-bot`. Two Neon rows (`web` + `grok-bot`) means both platforms hit the same database.

```bash
npm run attach:neon
# or:
node scripts/zero-touch-attach.mjs \
  --vercel-project=cursor-grok-proof \
  --neon-project=cursor-grok-proof \
  --github=aleuer80-cpu/cursor-grok-proof
```

Never commit `NEON_API_KEY`, `VERCEL_TOKEN`, or `DATABASE_URL`. Never paste them into Notion.

## Ongoing loop (after day one)

Hard rule: **the backend must grow with the app autonomously.** Day one (the 5-step chain above) ends when GitHub, Vercel, Notion intelligence, and Neon storage (`DATABASE_URL`) exist. After that, every feature request in Cursor or Grok Bot grows the backend without Aaron.

When Aaron asks for a feature in **either** tool, the agent must, without him:

1. Change app code (UI + server).
2. Evolve Neon: add `src/db/migrations/00N_<name>.sql`, register it in `src/db/migrations.ts`, apply it against `DATABASE_URL` via Neon MCP/API (or `applyMigrations()`). Not SQL in the Neon console. Not the Vercel Storage tab.
3. Evolve API / server actions / route handlers to match.
4. Keep Notion intelligence current (what shipped, schema, env) on the playbook + Shipped Apps.
5. Commit, push to GitHub, let Vercel redeploy. Neon data/schema stays in sync with production.
6. Never require Aaron to push, migrate, or click Storage.

Proof today: `001_approvals` + **Tested and Approved** write. Future features add tables the same way. Same behavior if the request starts in Grok Bot or Cursor — both must be able to migrate Neon and ship.

## One-time enables (ONCE, not per app)

After this list, Aaron never installs anything for a new app.

### Cursor (once)

| Piece | Enable | Then agents can |
| --- | --- | --- |
| GitHub MCP | Already working. Fine-grained PAT: **Administration:write** + **Contents:write**, or classic repo-scoped. **Reuse it.** | `create_repository` / `push_files` |
| Vercel MCP + `VERCEL_TOKEN` | Plugin already connected; Hobby MCP **403**. Persist **`VERCEL_TOKEN`** as a Cloud Agent secret (not in git). Do not `vercel login` / Google / GitHub again. | Set env vars + create project + redeploy via API |
| Neon plugin + `NEON_API_KEY` | Enable Neon MCP at `https://mcp.neon.tech/mcp` (or `/add-plugin neon-postgres`). Persist **`NEON_API_KEY`** as a Cloud Agent secret. | Create the Neon project and get `DATABASE_URL` |
| Notion MCP | Already connected to Aaron Leuer’s Space. | Create the per-app page/db in Shipped Apps |

`.cursor/mcp.json` points at the official Neon remote MCP. Cloud Agents still need that server **enabled** in the environment; the file does not inject secrets. `.cursor/environment.json` is `npm ci` + `npm run dev`.

### Grok Bot (once, in-app)

Plugins are a **separate** auth list. Installing them in Cursor does **not** install them in Grok Bot.

Open Grok Bot → **Plugins** → **Add** each of these. Authorize each provider once. Then never again.

| Plugin | Search | Purpose |
| --- | --- | --- |
| **GitHub** | `GitHub` | Same GitHub account / same PAT as Cursor. Create + push repos. |
| **Notion** | `Notion` | **Required.** New page/db per app in Aaron Leuer’s Space. Marketplace id `notion-workspace`. |
| **Vercel** | `Vercel` | Project from GitHub + set `DATABASE_URL` on Production + Preview. |
| **Neon Postgres** | `neon` | Create Neon project/branch and return `DATABASE_URL`. |

If a Connect card appears, finish **Authorize** once. Do not start a new Google/GitHub login if that account is already the one Grok Bot uses.

## This proof app

- GitHub SoT: https://github.com/aleuer80-cpu/cursor-grok-proof
- Vercel: `cursor-grok-proof` · https://cursor-grok-proof.vercel.app
- Notion playbook: https://app.notion.com/p/3df103733b8f814b9ff1e6088b11be3d
- Cursor-visible Origin is optional and private. GitHub remains the deploy host.
- Neon is **MISS** until the next session with `NEON_API_KEY` + `VERCEL_TOKEN` runs `scripts/zero-touch-attach.mjs`.

Vercel MCP `list_teams` returns `[]` on this Hobby account. That is expected. Do not use the Storage tab to work around it.

## Local

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:43217. Submits work immediately in this preview (`.data/approvals.json`). With `DATABASE_URL` they go to Neon instead.

## App stack

Next.js 16 App Router, TypeScript, Tailwind, shadcn/ui, `@neondatabase/serverless`, native `<select>`. Schema-as-code: `src/db/migrations/*.sql` + `src/db/migrate.ts`. Zero-touch first-ship attach: `scripts/zero-touch-attach.mjs`.
