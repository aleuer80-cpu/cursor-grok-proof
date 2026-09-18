import { getSql, isNeonConfigured } from "@/lib/db"
import { ensureApprovalsTable } from "@/lib/store"

export type ServiceStatus = {
  name: string
  connected: boolean
  detail: string
  href?: string
}

const GITHUB_REPO =
  process.env.GITHUB_REPO_URL ??
  "https://github.com/aleuer80-cpu/cursor-grok-proof"
const GITHUB_API =
  "https://api.github.com/repos/aleuer80-cpu/cursor-grok-proof"

async function probeGitHub(): Promise<ServiceStatus> {
  try {
    const res = await fetch(GITHUB_API, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    })
    if (!res.ok) {
      return {
        name: "GitHub",
        connected: false,
        detail: `GitHub HTTP ${res.status}`,
        href: GITHUB_REPO,
      }
    }
    const data = (await res.json()) as { pushed_at?: string; full_name?: string }
    return {
      name: "GitHub",
      connected: true,
      detail: `${data.full_name ?? "aleuer80-cpu/cursor-grok-proof"} · last push ${
        data.pushed_at ? new Date(data.pushed_at).toLocaleString() : "unknown"
      }`,
      href: GITHUB_REPO,
    }
  } catch (error) {
    return {
      name: "GitHub",
      connected: false,
      detail: error instanceof Error ? error.message : "GitHub unreachable",
      href: GITHUB_REPO,
    }
  }
}

function probeVercel(): ServiceStatus {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : ""
  return {
    name: "Vercel",
    connected: Boolean(process.env.VERCEL),
    detail: vercelUrl || "Not deployed. Import the GitHub repo at vercel.com/new",
    href: vercelUrl || "https://vercel.com/new",
  }
}

async function probeNeon(): Promise<ServiceStatus> {
  if (!isNeonConfigured()) {
    return {
      name: "Neon",
      connected: false,
      detail: "DATABASE_URL missing. Add Neon on the Vercel project Storage tab.",
    }
  }
  try {
    const sql = getSql()
    await ensureApprovalsTable()
    const rows = (await sql`
      SELECT COUNT(*)::int AS n FROM approvals
    `) as { n: number }[]
    return {
      name: "Neon",
      connected: true,
      detail: `${rows[0]?.n ?? 0} rows in approvals`,
    }
  } catch (error) {
    return {
      name: "Neon",
      connected: false,
      detail: error instanceof Error ? error.message : "Neon query failed",
    }
  }
}

export async function getStackStatus(): Promise<ServiceStatus[]> {
  const [github, neon] = await Promise.all([probeGitHub(), probeNeon()])
  return [github, probeVercel(), neon]
}
