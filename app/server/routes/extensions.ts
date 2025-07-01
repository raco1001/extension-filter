import { Hono } from 'hono'
import { validator } from 'hono/validator'
import { extensionService } from '../services/extensionService'
import {
  ApiResponse,
  ExtensionsResponse,
  UpdateFixedExtensionRequest,
  CreateCustomExtensionRequest,
  DeleteCustomExtensionRequest,
  HTTP_STATUS,
} from '../types/api'

const extensionsRouter = new Hono()

extensionsRouter.get('/', async (c) => {
  try {
    const data = await extensionService.getAllExtensions()

    const response: ApiResponse<ExtensionsResponse> = {
      success: true,
      data,
      message: '확장자 목록을 성공적으로 조회했습니다',
    }

    return c.json(response, HTTP_STATUS.OK as any)
  } catch (error) {
    throw error // 글로벌 에러 핸들러에서 처리
  }
})

extensionsRouter.put(
  '/fixed',
  validator('json', (value, c) => {
    if (!value || typeof value !== 'object') {
      return c.json(
        {
          success: false,
          error: '유효하지 않은 요청 데이터입니다',
        },
        400,
      )
    }

    const { name, blocked } = value as any

    if (!name || typeof name !== 'string') {
      return c.json(
        {
          success: false,
          error: '확장자 이름이 필요합니다',
        },
        400,
      )
    }

    if (typeof blocked !== 'boolean') {
      return c.json(
        {
          success: false,
          error: '차단 상태는 boolean 값이어야 합니다',
        },
        400,
      )
    }

    return { name, blocked }
  }),
  async (c) => {
    try {
      const request = c.req.valid('json') as UpdateFixedExtensionRequest
      const data = await extensionService.updateFixedExtension(request)

      const response: ApiResponse = {
        success: true,
        data,
        message: `고정 확장자 "${request.name}"이 성공적으로 업데이트되었습니다`,
      }

      return c.json(response, HTTP_STATUS.OK as any)
    } catch (error) {
      throw error
    }
  },
)

extensionsRouter.post(
  '/custom',
  validator('json', (value, c) => {
    if (!value || typeof value !== 'object') {
      return c.json(
        {
          success: false,
          error: '유효하지 않은 요청 데이터입니다',
        },
        400,
      )
    }

    const { name } = value as any

    if (!name || typeof name !== 'string') {
      return c.json(
        {
          success: false,
          error: '확장자 이름이 필요합니다',
        },
        400,
      )
    }

    return { name }
  }),
  async (c) => {
    try {
      const request = c.req.valid('json') as CreateCustomExtensionRequest
      const data = await extensionService.createCustomExtension(request)

      const response: ApiResponse = {
        success: true,
        data,
        message: `커스텀 확장자 "${request.name}"이 성공적으로 추가되었습니다`,
      }

      return c.json(response, HTTP_STATUS.CREATED as any)
    } catch (error) {
      throw error
    }
  },
)

extensionsRouter.delete(
  '/custom',
  validator('json', (value, c) => {
    if (!value || typeof value !== 'object') {
      return c.json(
        {
          success: false,
          error: '유효하지 않은 요청 데이터입니다',
        },
        400,
      )
    }

    const { name } = value as any

    if (!name || typeof name !== 'string') {
      return c.json(
        {
          success: false,
          error: '삭제할 확장자 이름이 필요합니다',
        },
        400,
      )
    }

    return { name }
  }),
  async (c) => {
    try {
      const request = c.req.valid('json') as DeleteCustomExtensionRequest
      await extensionService.deleteCustomExtension(request)

      const response: ApiResponse = {
        success: true,
        message: `커스텀 확장자 "${request.name}"이 성공적으로 삭제되었습니다`,
      }

      return c.json(response, HTTP_STATUS.OK as any)
    } catch (error) {
      throw error
    }
  },
)

export { extensionsRouter }
