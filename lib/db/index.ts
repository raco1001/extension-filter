import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

if (!process.env.DIRECT_URL) {
  throw new Error('DATABASE_URL is not set')
}

const client = postgres(process.env.DIRECT_URL, { max: 1 })
export const db = drizzle(client)
