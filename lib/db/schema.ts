import { pgTable, serial, text, boolean } from 'drizzle-orm/pg-core'

export const fixedExtensions = pgTable('fixed_extensions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  blocked: boolean('blocked').notNull().default(false),
})

export const customExtensions = pgTable('custom_extensions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
})
