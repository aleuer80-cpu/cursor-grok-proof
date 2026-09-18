#!/usr/bin/env node
/**
 * Zero-touch Neon → Vercel attach (no Storage tab, no consoles, no extra OAuth).
 *
 * Per app, after GitHub exists and Vercel is watching that repo, an agent runs:
 *   NEON_API_KEY=… VERCEL_TOKEN=… node scripts/zero-touch-attach.mjs
 *
 * This script:
 *   1. Creates or reuses a Neon project and returns a pooled DATABASE_URL
 *   2. Upserts DATABASE_URL on Vercel Production + Preview (+ Development)
 *   3. Redeploys production so the app can write Tested and Approved to Postgres
 *
 * Prints redacted status only. Never logs the connection string.
 */

const NEON_API = "https://console.neon.tech/api/v2"
const VERCEL_API = "https://api.vercel.com"

function arg(name, fallback = "") {
  const prefix = `--${name}=`
  const hit = process.argv.find((item) => item.startsWith(prefix))
  if (hit) return hit.slice(prefix.length)
  const envName = name.replaceAll("-", "_").toUpperCase()
  return process.env[envName] || fallback
}

function requiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing ${name}. Persist it once as a Cursor Cloud / Grok Bot secret. Do not open Vercel Storage.`
    )
  }
  return value
}

function redactDbUrl(url) {
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.username || "user"}:***@${parsed.host}${parsed.pathname}`
  } catch {
    return "(unparseable DATABASE_URL)"
  }
}

async function neon(path, { method = "GET", body } = {}) {
  const res = await fetch(`${NEON_API}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${requiredEnv("NEON_API_KEY")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }
  if (!res.ok) {
    throw new Error(
      `Neon ${method} ${path} → HTTP ${res.status}: ${data.message || text || "error"}`
    )
  }
  return data
}

async function vercel(path, { method = "GET", body } = {}) {
  const team = process.env.VERCEL_TEAM_ID || process.env.VERCEL_ORG_ID || ""
  const suffix = team && !path.includes("teamId=")
    ? `${path.includes("?") ? "&" : "?"}teamId=${encodeURIComponent(team)}`
    : ""
  const res = await fetch(`${VERCEL_API}${path}${suffix}`, {
    method,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${requiredEnv("VERCEL_TOKEN")}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }
  }
  if (!res.ok) {
    throw new Error(
      `Vercel ${method} ${path} → HTTP ${res.status}: ${
        data.error?.message || data.message || text || "error"
      }`
    )
  }
  return data
}

async function firstNeonOrgId() {
  try {
    const orgs = await neon("/users/me/organizations")
    const id = orgs.organizations?.[0]?.id || orgs[0]?.id
    return id || ""
  } catch {
    return ""
  }
}

async function ensureNeonProject(name) {
  const listed = await neon("/projects")
  const existing = (listed.projects || []).find((project) => project.name === name)
  if (existing) {
    console.log(`Neon: reusing project ${existing.id} (${existing.name})`)
    return existing
  }

  const orgId = process.env.NEON_ORG_ID || (await firstNeonOrgId())
  const created = await neon("/projects", {
    method: "POST",
    body: {
      project: {
        name,
        pg_version: 17,
        ...(orgId ? { org_id: orgId } : {}),
      },
    },
  })
  const project = created.project
  console.log(`Neon: created project ${project.id} (${project.name})`)
  return project
}

async function neonConnectionUri(projectId) {
  const listed = await neon(`/projects/${projectId}/branches`)
  const branches = listed.branches || []
  const branch = branches.find((item) => item.default) || branches[0]
  if (!branch) {
    throw new Error(`Neon project ${projectId} has no branches`)
  }
  const databases = await neon(
    `/projects/${projectId}/branches/${branch.id}/databases`
  )
  const roles = await neon(`/projects/${projectId}/branches/${branch.id}/roles`)
  const databaseName = databases.databases?.[0]?.name || "neondb"
  const roleName = roles.roles?.[0]?.name || "neondb_owner"
  const uri = await neon(
    `/projects/${projectId}/connection_uri?branch_id=${encodeURIComponent(
      branch.id
    )}&database_name=${encodeURIComponent(databaseName)}&role_name=${encodeURIComponent(
      roleName
    )}&pooled=true`
  )
  if (!uri.uri) {
    throw new Error("Neon did not return a connection URI")
  }
  return uri.uri
}

async function ensureVercelProject(projectName, githubRepo) {
  try {
    const project = await vercel(`/v9/projects/${encodeURIComponent(projectName)}`)
    console.log(`Vercel: reusing project ${project.id} (${project.name})`)
    return project
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (!message.includes("HTTP 404")) throw error
  }

  if (!githubRepo) {
    throw new Error(
      `Vercel project ${projectName} not found. Pass --github=owner/repo so the script can create it from Git.`
    )
  }

  const created = await vercel("/v11/projects", {
    method: "POST",
    body: {
      name: projectName,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: githubRepo,
      },
    },
  })
  console.log(`Vercel: created project ${created.id} from GitHub ${githubRepo}`)
  return created
}

async function setDatabaseUrl(projectId, databaseUrl) {
  const payload = [
    {
      key: "DATABASE_URL",
      value: databaseUrl,
      type: "encrypted",
      target: ["production", "preview", "development"],
      comment: "Set by scripts/zero-touch-attach.mjs (Neon API, not Marketplace)",
    },
  ]
  await vercel(`/v10/projects/${encodeURIComponent(projectId)}/env?upsert=true`, {
    method: "POST",
    body: payload,
  })
  console.log("Vercel: upserted DATABASE_URL on production + preview + development")
}

async function redeployProduction(project) {
  const projectId = project.id || project.name
  const deployments = await vercel(
    `/v6/deployments?projectId=${encodeURIComponent(projectId)}&limit=1`
  )
  const latest = deployments.deployments?.[0]
  if (latest?.uid) {
    const redeployed = await vercel("/v13/deployments?forceNew=1", {
      method: "POST",
      body: {
        deploymentId: latest.uid,
        name: project.name,
        target: "production",
        meta: { action: "redeploy" },
      },
    })
    console.log(
      `Vercel: redeployed ${redeployed.id || redeployed.uid || latest.uid} → production`
    )
    return
  }

  const link = project.link
  if (link?.type === "github" && (link.repoId || link.repo)) {
    const gitSource = {
      type: "github",
      ref: link.productionBranch || "main",
      ...(link.repoId ? { repoId: link.repoId } : null),
      ...(link.org && link.repo ? { org: link.org, repo: link.repo } : null),
    }
    const created = await vercel("/v13/deployments?forceNew=1", {
      method: "POST",
      body: {
        name: project.name,
        project: project.id,
        target: "production",
        gitSource,
      },
    })
    console.log(`Vercel: created production deployment ${created.id || created.uid}`)
    return
  }

  throw new Error("Could not redeploy: no prior deployment and no GitHub link on the Vercel project")
}

async function verifyNeonWrite(databaseUrl) {
  const { neon: neonSql } = await import("@neondatabase/serverless")
  const sql = neonSql(databaseUrl)
  await sql`
    CREATE TABLE IF NOT EXISTS approvals (
      id SERIAL PRIMARY KEY,
      phrase TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'web',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  const rows = await sql`
    INSERT INTO approvals (phrase, source)
    VALUES ('Tested and Approved', 'agent-attach')
    RETURNING id
  `
  const id = rows[0]?.id
  console.log(`Neon write HIT: approvals row ${id} (source=agent-attach)`)
}

async function main() {
  const neonName = arg("neon-project", "cursor-grok-proof")
  const vercelName = arg("vercel-project", "cursor-grok-proof")
  const githubRepo = arg("github", "aleuer80-cpu/cursor-grok-proof")

  requiredEnv("NEON_API_KEY")
  requiredEnv("VERCEL_TOKEN")

  const neonProject = await ensureNeonProject(neonName)
  const databaseUrl = await neonConnectionUri(neonProject.id)
  console.log(`Neon: DATABASE_URL ready (${redactDbUrl(databaseUrl)})`)

  const vercelProject = await ensureVercelProject(vercelName, githubRepo)
  await setDatabaseUrl(vercelProject.id, databaseUrl)
  await redeployProduction(vercelProject)
  await verifyNeonWrite(databaseUrl)

  console.log("HIT path: Neon project → Vercel env API → production redeploy → Postgres write. Storage tab was not used.")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
