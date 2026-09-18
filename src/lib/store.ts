import "server-only"

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import {
  APPROVED_PHRASE,
  type ApprovalRow,
  type SaveDestination,
} from "@/lib/approvals"
import { getSql, isNeonConfigured } from "@/lib/db"

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "approvals.json")

async function readLocalStore(): Promise<ApprovalRow[]> {
  try {
    const raw = await readFile(LOCAL_STORE_PATH, "utf8")
    const parsed = JSON.parse(raw) as ApprovalRow[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function listLocalApprovals(): Promise<ApprovalRow[]> {
  const rows = await readLocalStore()
  return rows
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 20)
}

async function saveLocalApproval(source: string): Promise<ApprovalRow> {
  const rows = await readLocalStore()
  const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1
  const row: ApprovalRow = {
    id: nextId,
    phrase: APPROVED_PHRASE,
    source,
    created_at: new Date().toISOString(),
  }
  const next = [row, ...rows].slice(0, 20)
  await mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true })
  await writeFile(LOCAL_STORE_PATH, JSON.stringify(next, null, 2), "utf8")
  return row
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

function asApprovalRows(rows: Record<string, unknown>[]): ApprovalRow[] {
  return rows.map((row) => ({
    id: Number(row.id),
    phrase: String(row.phrase),
    source: String(row.source),
    created_at: String(row.created_at),
  }))
}

export async function listApprovals(): Promise<ApprovalRow[]> {
  if (isNeonConfigured()) {
    const sql = getSql()
    await ensureApprovalsTable()
    const rows = await sql`
      SELECT id, phrase, source, created_at
      FROM approvals
      ORDER BY created_at DESC
      LIMIT 20
    `
    return asApprovalRows(rows)
  }

  if (process.env.VERCEL) return []
  return listLocalApprovals()
}

export async function saveApproval(
  source: string
): Promise<{ row: ApprovalRow; destination: SaveDestination }> {
  if (isNeonConfigured()) {
    const sql = getSql()
    await ensureApprovalsTable()
    const rows = await sql`
      INSERT INTO approvals (phrase, source)
      VALUES (${APPROVED_PHRASE}, ${source})
      RETURNING id, phrase, source, created_at
    `
    return { row: asApprovalRows(rows)[0], destination: "neon" }
  }

  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL is missing on Vercel. Add Neon in the project Storage tab, then redeploy."
    )
  }

  const row = await saveLocalApproval(source)
  return { row, destination: "preview" }
}
