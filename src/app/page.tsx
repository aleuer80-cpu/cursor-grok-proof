import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ApprovalForm } from "@/components/approval-form"
import { resolveWriteSource } from "@/lib/approvals"
import { listApprovals } from "@/lib/store"
import { isNeonConfigured } from "@/lib/db"
import { getStackStatus } from "@/lib/status"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>
}) {
  const stack = getStackStatus()
  const neonReady = isNeonConfigured()
  const { source: sourceParam } = await searchParams
  const source = resolveWriteSource(sourceParam)
  let approvals: Awaited<ReturnType<typeof listApprovals>> = []
  let neonError = ""

  try {
    approvals = await listApprovals()
  } catch (error) {
    neonError = error instanceof Error ? error.message : "Could not read saved rows"
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-1 flex-col items-center justify-center gap-10 px-6 py-16">
      <div className="text-center">
        <p className="mb-3 text-sm font-medium tracking-[0.2em] text-muted-foreground uppercase">
          GitHub → Vercel → Neon
        </p>
        <h1 className="text-6xl font-semibold tracking-tight sm:text-8xl">
          TEST REPO
        </h1>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-2">
        {stack.map((service) => (
          <li key={service.name}>
            <Badge variant={service.connected ? "default" : "outline"}>
              {service.name}: {service.connected ? "connected" : "pending"}
            </Badge>
          </li>
        ))}
      </ul>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Tested and Approved</CardTitle>
          <CardDescription>
            Saving this dropdown writes Tested and Approved. In this preview
            the row is stored locally; with Neon on Vercel it lands in
            Postgres so Cursor and Grok Bot share the same table.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {neonReady ? null : (
            <p className="text-sm text-muted-foreground">
              Neon is not attached yet. Use the dropdown and submit anyway —
              this preview stores the row locally so you can prove the write
              path. After Neon is added on Vercel, the same submit writes to
              Postgres.
            </p>
          )}
          {neonError ? (
            <p className="text-sm text-destructive">{neonError}</p>
          ) : null}
          <ApprovalForm neonReady={neonReady} source={source} />
          <div>
            <h2 className="mb-2 text-sm font-medium">
              {approvals.length === 0
                ? neonReady
                  ? "No submissions in Neon"
                  : "No submissions in this preview"
                : `${approvals.length} ${
                    approvals.length === 1 ? "submission" : "submissions"
                  } ${neonReady ? "in Neon" : "in this preview"}`}
            </h2>
            {approvals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approvals written yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {approvals.map((row) => (
                  <li
                    key={row.id}
                    className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border py-2 last:border-0"
                  >
                    <span>
                      #{row.id} {row.phrase}{" "}
                      <span className="text-muted-foreground">
                        from {row.source}
                      </span>
                    </span>
                    <time className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
