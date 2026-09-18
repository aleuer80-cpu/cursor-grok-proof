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

async function githubJson<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error(`GitHub HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

async function probeVercel(): Promise<ServiceStatus> {
  const localUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : ""

  if (process.env.VERCEL) {
    return {
      name: "Vercel",
      connected: true,
      detail: localUrl || "Running on Vercel",
      href: localUrl || GITHUB_REPO,
    }
  }

  try {
    const deployments = await githubJson<
      { id: number; statuses_url: string; created_at: string }[]
    >("/deployments?per_page=1")
    if (!deployments.length) {
      return {
        name: "Vercel",
        connected: false,
        detail: "No Vercel deployments on GitHub yet",
        href: "https://vercel.com/new",
      }
    }
    const statuses = await githubJson<
      { state: string; description?: string; environment_url?: string; target_url?: string }[]
    >(
      `/deployments/${deployments[0].id}/statuses`
    )
    const latest = statuses[0]
    const url = latest?.environment_url || latest?.target_url || ""
    if (latest?.state === "success") {
      return {
        name: "Vercel",
        connected: true,
        detail: `production ready${url ? ` · ${url}` : ""}`,
        href: url || GITHUB_REPO,
      }
    }
    return {
      name: "Vercel",
      connected: false,
      detail:
        latest?.state === "failure"
          ? "Vercel build failed. Push a green `next build` to GitHub."
          : `Vercel deploy ${latest?.state ?? "unknown"}`,
      href: url || `${GITHUB_REPO}/deployments`,
    }
  } catch (error) {
    return {
      name: "Vercel",
      connected: false,
      detail: error instanceof Error ? error.message : "Could not read Vercel status",
      href: `${GITHUB_REPO}/deployments`,
    }
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
    const rows = await sql`
      SELECT COUNT(*)::int AS n FROM approvals
    `
    const n = Number(rows[0]?.n ?? 0)
    return {
      name: "Neon",
      connected: true,
      detail: `${n} rows in approvals`,
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
  const [github, vercel, neon] = await Promise.all([
    probeGitHub(),
    probeVercel(),
    probeNeon(),
  ])
  return [github, vercel, neon]
}
