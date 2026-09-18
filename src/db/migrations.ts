export type Migration = {
  id: string
  statements: string[]
}

/**
 * Schema-as-code. Keep each entry in sync with `src/db/migrations/<id>.sql`.
 * Agents append a migration when a feature needs new tables, columns, or indexes.
 */
export const MIGRATIONS: Migration[] = [
  {
    id: "001_approvals",
    statements: [
      `CREATE TABLE IF NOT EXISTS approvals (
        id SERIAL PRIMARY KEY,
        phrase TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'web',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS approvals_created_at_idx ON approvals (created_at DESC)`,
    ],
  },
]
