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

export type SaveDestination = "neon" | "preview"
