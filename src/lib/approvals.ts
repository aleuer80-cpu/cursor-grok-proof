import { getSql, isNeonConfigured } from "@/lib/db"

export const APPROVED_PHRASE = "Tested and Approved"

export type WriteSource = "web" | "grok-bot"

export function resolveWriteSource(raw: string | null | undefined): WriteSource {
  return raw === "grok-bot" ? "grok-bot" : "web"
}

export type ApprovalRow = {
  id: number
  phrase: string
  source: string
  created_at: string
}

export async function ensureApprovalsTable() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS approvals (
      id SERIAL PRIMARY KEY,
      phrase TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'web',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function listApprovals(): Promise<ApprovalRow[]> {
  if (!isNeonConfigured()) return []
  const sql = getSql()
  await ensureApprovalsTable()
  return sql`
    SELECT id, phrase, source, created_at
    FROM approvals
    ORDER BY created_at DESC
    LIMIT 20
  ` as Promise<ApprovalRow[]>
}

export async function saveApproval(source: string) {
  const sql = getSql()
  await ensureApprovalsTable()
  const rows = (await sql`
    INSERT INTO approvals (phrase, source)
    VALUES (${APPROVED_PHRASE}, ${source})
    RETURNING id, phrase, source, created_at
  `) as ApprovalRow[]
  return rows[0]
}
