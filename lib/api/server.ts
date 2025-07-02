import { createHonoApp } from '@/lib/hono/factory'

export const createApiApp = () => {
  const app = createHonoApp()

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

export type ApiAppType = ReturnType<typeof createApiApp>

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

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

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
