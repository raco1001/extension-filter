import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // API 요청에 대한 추가 헤더
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('X-API-Route', 'true')
    response.headers.set('X-API-Version', '2.0.0')
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
