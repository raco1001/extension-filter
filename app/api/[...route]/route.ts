import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { fixedExtensions, customExtensions } from '@/lib/db/schema'

const app = new Hono().basePath('/api')

app.get('/extensions', async (c) => {
  const fixed = await db.select().from(fixedExtensions)
  const custom = await db.select().from(customExtensions)
  return c.json({ fixed, custom })
})

app.post('/extensions/fixed', async (c) => {
  const { name, blocked } = await c.req.json<{
    name: string
    blocked: boolean
  }>()

  try {
    const existing = await db
      .select()
      .from(fixedExtensions)
      .where(eq(fixedExtensions.name, name))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(fixedExtensions)
        .set({ blocked })
        .where(eq(fixedExtensions.name, name))
    } else {
      await db.insert(fixedExtensions).values({ name, blocked })
    }
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/extensions/custom', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name) return c.json({ error: 'Name is required' }, 400)

  try {
    const [newExtension] = await db
      .insert(customExtensions)
      .values({ name })
      .returning()
    return c.json(newExtension)
  } catch (error: any) {
    if (error.code === '23505') {
      return c.json({ error: 'Extension already exists' }, 409)
    }
    return c.json({ error: error.message }, 500)
  }
})

app.delete('/extensions/custom', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name) return c.json({ error: 'Name is required' }, 400)

  try {
    await db.delete(customExtensions).where(eq(customExtensions.name, name))
    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export const GET = handle(app)
export const POST = handle(app)
export const DELETE = handle(app)
