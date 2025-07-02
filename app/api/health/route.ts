export const runtime = 'nodejs'

import { createHonoApp, createApiResponse } from '@/lib/hono/factory'
import { handle } from 'hono/vercel'

const app = createHonoApp()

app.get('/', (c) => {
  const timestamp = new Date().toISOString()

  return c.json(
    createApiResponse(
      true,
      {
        status: 'healthy',
        timestamp,
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        runtime: 'edge',
      },
      '서버가 정상적으로 실행 중입니다',
    ),
    200,
  )
})

export const GET = handle(app)
