import { Hono } from 'hono'
import {
  corsMiddleware,
  loggerMiddleware,
  prettyJSONMiddleware,
  requestIdMiddleware,
  securityMiddleware,
  errorHandler,
  notFoundHandler,
} from './middlewares'
import { extensionsRouter } from './routes/extensions'
import { HTTP_STATUS } from './types/api'

const app = new Hono()

app.use('*', requestIdMiddleware)
app.use('*', securityMiddleware)
app.use('*', corsMiddleware)
app.use('*', loggerMiddleware)
app.use('*', prettyJSONMiddleware)

app.get('/api/health', (c) => {
  const uptime = process.uptime()
  const timestamp = new Date().toISOString()

  return c.json(
    {
      success: true,
      data: {
        status: 'healthy',
        uptime: `${Math.floor(uptime)}s`,
        timestamp,
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      message: '서버가 정상적으로 실행 중입니다',
    },
    HTTP_STATUS.OK as any,
  )
})

app.get('/api', (c) => {
  return c.json(
    {
      success: true,
      data: {
        name: 'Extension Filter API',
        version: '1.0.0',
        description: '파일 확장자 필터링 시스템 API',
        endpoints: {
          'GET /api/health': '서버 상태 확인',
          'GET /api/extensions': '모든 확장자 조회',
          'PUT /api/extensions/fixed': '고정 확장자 업데이트',
          'POST /api/extensions/custom': '커스텀 확장자 생성',
          'DELETE /api/extensions/custom': '커스텀 확장자 삭제',
        },
      },
      message: 'Extension Filter API에 오신 것을 환영합니다!',
    },
    HTTP_STATUS.OK as any,
  )
})

app.route('/api/extensions', extensionsRouter)

app.onError(errorHandler)
app.notFound(notFoundHandler)

export default app
export { app }
