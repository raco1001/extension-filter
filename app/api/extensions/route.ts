// Edge runtime 가능! (Supabase HTTP-based)

import { createHonoApp, createApiResponse } from '@/lib/hono/factory'
import { handle } from 'hono/vercel'
import { getAllExtensions } from '@/lib/supabase/queries'

const app = createHonoApp()

app.get('/', async (c) => {
  try {
    const data = await getAllExtensions()
    return c.json(
      createApiResponse(true, data, '확장자 목록을 성공적으로 조회했습니다'),
      200,
    )
  } catch (error) {
    console.error('Extensions fetch error:', error)
    return c.json(
      createApiResponse(
        false,
        undefined,
        undefined,
        '확장자 목록 조회 중 오류가 발생했습니다',
      ),
      500,
    )
  }
})

export const GET = handle(app)
export const runtime = 'edge' // ✅ Supabase로 Edge Runtime 가능!
