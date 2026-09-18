# TEST REPO

Proof site for the GitHub → Vercel → Neon path shared by Cursor and Grok Bot.

- GitHub: https://github.com/aleuer80-cpu/cursor-grok-proof
- Homepage copy: **TEST REPO**
- One dropdown value: **Tested and Approved**
- Neon table: `approvals` (`id`, `phrase`, `source`, `created_at`)

The homepage badges actually probe each hop: GitHub API, Vercel env, Neon `COUNT(*)`.

## Cursor Origin repo

This cloud-agent token cannot mint a named Origin repo (`origin repo create` / `create-mirrored` return not scoped). To see **cursor-grok-proof** under Cursor Repositories / Codebase:

1. Click **Create repo** above the agent input.
2. Name it `cursor-grok-proof`.
3. Create the Origin repo.

That publishes this draft so it shows up at [cursor.com/codebase](https://cursor.com/codebase).

## Local

```bash
npm install
npm run dev
```

Opens at http://127.0.0.1:43217. Submits work immediately in this preview (`.data/approvals.json`). With `DATABASE_URL` they go to Neon instead.

## Connect Vercel (dashboard)

This agent cannot git-link Vercel on personal Hobby `aleuer80-cpu` (API 403). Import the GitHub repo yourself:

1. Open [vercel.com/new](https://vercel.com/new).
2. Import **aleuer80-cpu/cursor-grok-proof**.
3. Deploy.

## Connect Neon (on that Vercel project)

1. Storage / Marketplace → add **Neon**.
2. Confirm `DATABASE_URL` for Production and Preview.
3. Redeploy if needed.
4. Re-submit **Tested and Approved** on the Vercel URL so rows land in Postgres (preview rows stay local).

## Prove Cursor and Grok Bot share the stack

1. Point Grok Bot’s GitHub plugin at **aleuer80-cpu/cursor-grok-proof**.
2. Confirm `src/app/page.tsx` still says TEST REPO.
3. After Vercel + Neon, open the production URL with `/?source=grok-bot` and submit.
4. Submit once from Cursor without the query (`web`).
5. Both rows in Neon means both platforms hit the same database.
