# TEST REPO

Proof site for the GitHub → Vercel → Neon path shared by Cursor and Grok Bot.

- GitHub: https://github.com/aleuer80-cpu/cursor-grok-proof
- Homepage copy: **TEST REPO**
- One dropdown value: **Tested and Approved**
- Neon table: `approvals` (`id`, `phrase`, `source`, `created_at`)

## Local

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:43217. Copy `.env.example` to `.env.local` and set `DATABASE_URL` if you want local Neon writes.

## Connect Vercel (once, in the dashboard)

This Cloud Agent cannot git-link a Vercel project on the personal Hobby account `aleuer80-cpu`. Import the GitHub repo yourself so later pushes to `main` deploy:

1. Open [vercel.com/new](https://vercel.com/new).
2. Import **aleuer80-cpu/cursor-grok-proof**.
3. Deploy. Framework is Next.js; leave defaults.

## Connect Neon (once, on that Vercel project)

1. In the Vercel project, open Storage / Marketplace and add **Neon**.
2. Confirm `DATABASE_URL` is set for Production and Preview.
3. Redeploy if the first build ran before Neon was attached.

When Neon is live, the site badge reads `Neon: connected` and **Write to Neon** is enabled.

## Prove Cursor and Grok Bot share the stack

1. Confirm Grok Bot’s GitHub plugin is pointed at **aleuer80-cpu/cursor-grok-proof** (same repo Cursor uses).
2. From Grok Bot, open `src/app/page.tsx` and confirm the heading is still `TEST REPO`.
3. After Vercel + Neon are connected, open the production URL with `/?source=grok-bot`.
4. Leave the dropdown on **Tested and Approved** and click **Write to Neon**.
5. A row should appear: `Tested and Approved` from `grok-bot`.
6. From Cursor (or the same URL without the query), submit again. That row is tagged `web`.
7. Both rows in one list means both platforms wrote to the same Neon database.

Vercel, Neon, and Notion plugins in Grok Bot are a separate install/auth list from Cursor MCP. GitHub is the shared source of truth once both tools can write to this repo.
