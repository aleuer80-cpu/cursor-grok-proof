"use client"

import { useActionState, useState } from "react"
import { saveTestedAndApproved, type SaveResult } from "@/app/actions"
import { APPROVED_PHRASE } from "@/lib/approvals"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ApprovalForm({
  neonReady,
  source,
}: {
  neonReady: boolean
  source: "web" | "grok-bot"
}) {
  const [phrase, setPhrase] = useState(APPROVED_PHRASE)
  const [result, action, pending] = useActionState(
    saveTestedAndApproved,
    null as SaveResult | null
  )

  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-4">
      <input type="hidden" name="phrase" value={phrase} />
      <input type="hidden" name="source" value={source} />
      <div className="flex flex-col gap-2">
        <Label htmlFor="phrase-select">Neon write check</Label>
        <Select value={phrase} onValueChange={setPhrase}>
          <SelectTrigger id="phrase-select" className="w-full">
            <SelectValue placeholder="Choose a phrase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={APPROVED_PHRASE}>{APPROVED_PHRASE}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground">
        This submit is tagged <span className="font-medium">{source}</span>.
      </p>
      <Button type="submit" disabled={pending || !neonReady}>
        {pending ? "Writing…" : "Write to Neon"}
      </Button>
      {result ? (
        <p className={result.ok ? "text-sm" : "text-sm text-destructive"}>
          {result.message}
        </p>
      ) : null}
    </form>
  )
}
