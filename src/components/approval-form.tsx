"use client"

import { useActionState } from "react"
import { saveTestedAndApproved, type SaveResult } from "@/app/actions"
import { APPROVED_PHRASE, type WriteSource } from "@/lib/approvals"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function ApprovalForm({
  neonReady,
  source,
}: {
  neonReady: boolean
  source: WriteSource
}) {
  const [result, action, pending] = useActionState(
    saveTestedAndApproved,
    null as SaveResult | null
  )

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="phrase-select">Neon write check</Label>
        <select
          id="phrase-select"
          name="phrase"
          defaultValue={APPROVED_PHRASE}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value={APPROVED_PHRASE}>{APPROVED_PHRASE}</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        This submit is tagged <span className="font-medium">{source}</span>.
      </p>
      <Button type="submit" disabled={pending}>
        {pending
          ? "Writing…"
          : neonReady
            ? "Write to Neon"
            : "Write Tested and Approved"}
      </Button>
      {result ? (
        <p className={result.ok ? "text-sm" : "text-sm text-destructive"}>
          {result.message}
        </p>
      ) : null}
    </form>
  )
}
