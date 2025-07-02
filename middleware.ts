import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // 보안 헤더 설정 (모든 요청에 적용)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // API 요청에 대한 추가 헤더
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-API-Route', 'true')
    response.headers.set('X-API-Version', '2.0.0')

    // CORS preflight 처리
    if (request.method === 'OPTIONS') {
      const corsResponse = new NextResponse(null, { status: 200 })
      corsResponse.headers.set('Access-Control-Allow-Origin', '*')
      corsResponse.headers.set(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS',
      )
      corsResponse.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      )
      corsResponse.headers.set('Access-Control-Max-Age', '86400')
      return corsResponse
    }
  }

  // 정적 파일 캐싱 헤더
  if (
    request.nextUrl.pathname.startsWith('/_next/static/') ||
    request.nextUrl.pathname.includes('.') // 파일 확장자가 있는 경우
  ) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  }

  // 개발 모드에서 성능 모니터링
  if (process.env.NODE_ENV === 'development') {
    const start = Date.now()
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 다음을 제외한 모든 요청에 매칭:
     * - api routes (handled by our custom API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
