import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

type Variables = {
  requestId: string
}

export const createHonoApp = () => {
  const app = new Hono<{ Variables: Variables }>()

  // 공통 미들웨어 자동 적용
  app.use('*', async (c, next) => {
    // Request ID 생성
    const requestId = crypto.randomUUID()
    c.set('requestId', requestId)
    c.header('X-Request-ID', requestId)
    await next()
  })

  app.use('*', async (c, next) => {
    // 보안 헤더 설정
    c.header('X-Content-Type-Options', 'nosniff')
    c.header('X-Frame-Options', 'DENY')
    c.header('X-XSS-Protection', '1; mode=block')
    await next()
  })

  app.use(
    '*',
    cors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
      ].filter(Boolean),
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    }),
  )

  app.use(
    '*',
    logger((message, ...rest) => {
      console.log(`[${new Date().toISOString()}]`, message, ...rest)
    }),
  )

  app.use('*', prettyJSON())

  return app
}

export const createApiResponse = <T = any>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string,
) => ({
  success,
  ...(data && { data }),
  ...(message && { message }),
  ...(error && { error }),
})

export type ApiResponse<T = any> = ReturnType<typeof createApiResponse<T>>
