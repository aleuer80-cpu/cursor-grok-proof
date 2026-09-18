export type ServiceStatus = {
  name: string
  connected: boolean
  detail: string
}

export function getStackStatus(): ServiceStatus[] {
  const githubRepo =
    process.env.GITHUB_REPO_URL ??
    "https://github.com/aleuer80-cpu/cursor-grok-proof"
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : ""

  return [
    {
      name: "GitHub",
      connected: true,
      detail: githubRepo,
    },
    {
      name: "Vercel",
      connected: Boolean(process.env.VERCEL),
      detail: vercelUrl || "Not deployed on Vercel yet",
    },
    {
      name: "Neon",
      connected: Boolean(process.env.DATABASE_URL),
      detail: process.env.DATABASE_URL
        ? "DATABASE_URL is set"
        : "No Neon database provisioned yet",
    },
  ]
}
