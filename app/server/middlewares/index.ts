import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { Context, Next } from 'hono'
import { ApiError, ApiErrorCode, HTTP_STATUS } from '../types/api'

export const corsMiddleware = cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
})

export const loggerMiddleware = logger((message, ...rest) => {
  console.log(message, ...rest)
})

export const prettyJSONMiddleware = prettyJSON()

export const errorHandler = async (err: Error, c: Context) => {
  console.error('🚨 Server Error:', err)

  if (isApiError(err)) {
    const statusCode = getStatusCodeFromApiError(err.code)
    return c.json(
      {
        success: false,
        error: err.message,
        code: err.code,
        details: err.details,
      },
      statusCode as any,
    )
  }

  return c.json(
    {
      success: false,
      error: '서버 내부 오류가 발생했습니다',
      code: ApiErrorCode.INTERNAL_ERROR,
    },
    500,
  )
}

export const notFoundHandler = (c: Context) => {
  return c.json(
    {
      success: false,
      error: '요청한 리소스를 찾을 수 없습니다',
      code: ApiErrorCode.NOT_FOUND,
    },
    404,
  )
}

export const requestIdMiddleware = async (c: Context, next: Next) => {
  const requestId = crypto.randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-ID', requestId)
  await next()
}

export const securityMiddleware = async (c: Context, next: Next) => {
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')

  await next()
}

function isApiError(error: any): error is ApiError {
  return (
    error && typeof error.code === 'string' && typeof error.message === 'string'
  )
}

function getStatusCodeFromApiError(code: ApiErrorCode): number {
  switch (code) {
    case ApiErrorCode.VALIDATION_ERROR:
    case ApiErrorCode.BAD_REQUEST:
      return HTTP_STATUS.BAD_REQUEST
    case ApiErrorCode.NOT_FOUND:
      return HTTP_STATUS.NOT_FOUND
    case ApiErrorCode.CONFLICT:
      return HTTP_STATUS.CONFLICT
    case ApiErrorCode.INTERNAL_ERROR:
    default:
      return HTTP_STATUS.INTERNAL_SERVER_ERROR
  }
}
