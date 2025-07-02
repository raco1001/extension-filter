import { createHonoApp, createApiResponse } from '@/lib/hono/factory'
import { handle } from 'hono/vercel'
import {
  addCustomExtension,
  deleteCustomExtension,
} from '@/lib/supabase/queries'

const app = createHonoApp()

app.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name } = body

    if (typeof name !== 'string') {
      return c.json(
        createApiResponse(
          false,
          undefined,
          undefined,
          '확장자 이름이 필요합니다',
        ),
        400 as any,
      )
    }

    const data = await addCustomExtension(name)

    return c.json(
      createApiResponse(
        true,
        data,
        `커스텀 확장자 "${name}"이 성공적으로 추가되었습니다`,
      ),
      201,
    )
  } catch (error) {
    console.error('Custom extension creation error:', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : '커스텀 확장자 생성 중 오류가 발생했습니다'
    let statusCode = 500

    if (error instanceof Error) {
      if (
        error.message.includes('이미 존재') ||
        error.message.includes('동일한 이름')
      ) {
        statusCode = 409 // Conflict
      } else if (error.message.includes('최대')) {
        statusCode = 400 // Bad Request
      }
    }

    return c.json(
      createApiResponse(false, undefined, undefined, errorMessage),
      statusCode as any,
    )
  }
})

app.delete('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name } = body

    if (typeof name !== 'string') {
      return c.json(
        createApiResponse(
          false,
          undefined,
          undefined,
          '삭제할 확장자 이름이 필요합니다',
        ),
        400 as any,
      )
    }

    await deleteCustomExtension(name)

    return c.json(
      createApiResponse(
        true,
        undefined,
        `커스텀 확장자 "${name}"이 성공적으로 삭제되었습니다`,
      ),
      200,
    )
  } catch (error) {
    console.error('Custom extension deletion error:', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : '커스텀 확장자 삭제 중 오류가 발생했습니다'
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

export const POST = handle(app)
export const DELETE = handle(app)
export const runtime = 'edge'
