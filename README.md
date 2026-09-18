# TEST REPO

Proof site for the GitHub → Vercel → Neon path used by Cursor and Grok Bot.

- GitHub: https://github.com/aleuer80-cpu/cursor-grok-proof
- Page copy: **TEST REPO**
- Neon write: dropdown value `Tested and Approved`

## Local

```bash
npm install
npm run dev
```

Needs `DATABASE_URL` in `.env.local` after Neon is attached to the Vercel project.

## Grok Bot check

1. Open this GitHub repo.
2. Confirm the homepage still says TEST REPO.
3. Submit the dropdown **Tested and Approved**.
4. A new Neon row should appear with source `grok-bot` or `web`.
