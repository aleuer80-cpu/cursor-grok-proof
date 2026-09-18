-- Proof-app schema. Agents add 002_*.sql the same way when a feature needs new data.
-- Apply via Neon MCP/API against DATABASE_URL — not the Neon console.

CREATE TABLE IF NOT EXISTS approvals (
  id SERIAL PRIMARY KEY,
  phrase TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS approvals_created_at_idx ON approvals (created_at DESC);
