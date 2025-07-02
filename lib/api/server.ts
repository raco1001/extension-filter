import { createHonoApp } from '@/lib/hono/factory'

// 서버 사이드 API 앱 생성 (타입 추론용)
export const createApiApp = () => {
  const app = createHonoApp()

  // 예시 라우트 정의 (타입 추론을 위해)
  app.get('/extensions', async (c) => {
    return c.json({ success: true, data: [] })
  })

  app.put('/extensions/fixed', async (c) => {
    return c.json({ success: true })
  })

  app.post('/extensions/custom', async (c) => {
    return c.json({ success: true })
  })

  app.delete('/extensions/custom', async (c) => {
    return c.json({ success: true })
  })

  app.get('/health', async (c) => {
    return c.json({ success: true })
  })

  return app
}

// 타입 추출
export type ApiAppType = ReturnType<typeof createApiApp>

// 서버 사이드 API 응답 타입들
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ExtensionResponse {
  id: number
  name: string
  blocked?: boolean
}

export interface ExtensionsResponse {
  fixed: ExtensionResponse[]
  custom: ExtensionResponse[]
}

// 서버 액션 응답 타입
export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 에러 처리 유틸리티
export const createActionError = (message: string): ActionResponse => ({
  success: false,
  error: message,
})

export const createActionSuccess = <T>(
  data?: T,
  message?: string,
): ActionResponse<T> => ({
  success: true,
  ...(data && { data }),
  ...(message && { message }),
})
