"use server"

import { revalidatePath } from "next/cache"
import {
  APPROVED_PHRASE,
  resolveWriteSource,
  saveApproval,
} from "@/lib/approvals"
import { isNeonConfigured } from "@/lib/db"

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
      message: `Choose "${APPROVED_PHRASE}" before saving to Neon.`,
    }
  }

  if (!isNeonConfigured()) {
    return {
      ok: false,
      message: "Neon is not connected yet. DATABASE_URL is missing.",
    }
  }

  try {
    const row = await saveApproval(source)
    revalidatePath("/")
    return {
      ok: true,
      message: `Wrote "${row.phrase}" to Neon as row ${row.id}.`,
    }
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Neon error"
    return { ok: false, message: detail }
  }
}
