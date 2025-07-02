// Edge runtime 가능! (Supabase HTTP-based)

import { createHonoApp, createApiResponse } from '@/lib/hono/factory'
import { handle } from 'hono/vercel'
import { updateFixedExtension } from '@/lib/supabase/queries'
import {
  jsonValidator,
  validateUpdateFixedExtension,
} from '@/lib/hono/validators'

const app = createHonoApp()

app.put('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, blocked } = body

    if (typeof name !== 'string' || typeof blocked !== 'boolean') {
      return c.json(
        createApiResponse(
          false,
          undefined,
          undefined,
          '잘못된 요청 데이터입니다',
        ),
        400 as any,
      )
    }

    const data = await updateFixedExtension(name, blocked)

    return c.json(
      createApiResponse(
        true,
        data,
        `고정 확장자 "${name}"이 성공적으로 업데이트되었습니다`,
      ),
      200,
    )
  } catch (error) {
    console.error('Fixed extension update error:', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : '고정 확장자 업데이트 중 오류가 발생했습니다'
    const statusCode =
      error instanceof Error && error.message.includes('찾을 수 없습니다')
        ? 404
        : 500

    return c.json(
      createApiResponse(false, undefined, undefined, errorMessage),
      statusCode as any,
    )
  }
})

export const PUT = handle(app)
export const runtime = 'edge'
