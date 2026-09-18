import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

let sql: NeonQueryFunction<false, false> | null = null

export function getSql() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set")
  }
  if (!sql) {
    sql = neon(connectionString)
  }
  return sql
}

export function isNeonConfigured() {
  return Boolean(process.env.DATABASE_URL)
}
