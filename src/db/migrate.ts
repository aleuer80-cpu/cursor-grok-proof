import "server-only"

import { getSql } from "@/lib/db"
import { MIGRATIONS } from "@/db/migrations"

export async function applyMigrations() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  const appliedRows = await sql`SELECT id FROM schema_migrations`
  const applied = new Set(appliedRows.map((row) => String(row.id)))

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue
    await sql.transaction((txn) => [
      ...migration.statements.map((statement) => txn.query(statement)),
      txn`INSERT INTO schema_migrations (id) VALUES (${migration.id})`,
    ])
  }
}
