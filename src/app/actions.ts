"use server"

import { revalidatePath } from "next/cache"
import {
  APPROVED_PHRASE,
  resolveWriteSource,
} from "@/lib/approvals"
import { saveApproval } from "@/lib/store"

export type SaveResult = {
  ok: boolean
  message: string
}

export async function saveTestedAndApproved(
  _prev: SaveResult | null,
  formData: FormData
): Promise<SaveResult> {
  const phrase = String(formData.get("phrase") ?? "")
  const source = resolveWriteSource(String(formData.get("source") ?? "web"))

  if (phrase !== APPROVED_PHRASE) {
    return {
      ok: false,
      message: `Choose "${APPROVED_PHRASE}" before saving.`,
    }
  }

  try {
    const { row, destination } = await saveApproval(source)
    revalidatePath("/")
    if (destination === "neon") {
      return {
        ok: true,
        message: `Wrote "${row.phrase}" to Neon as row ${row.id}.`,
      }
    }
    return {
      ok: true,
      message: `Wrote "${row.phrase}" in this preview as row ${row.id}. Persist to Postgres after an agent attaches DATABASE_URL via Neon API + Vercel env API.`,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown write error"
    return { ok: false, message: detail }
  }
}
