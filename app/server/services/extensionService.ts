import {
  extensionRepository,
  IExtensionRepository,
} from '../repositories/extensionRepository'
import {
  FixedExtensionDB,
  CustomExtensionDB,
  ExtensionsResponse,
  UpdateFixedExtensionRequest,
  CreateCustomExtensionRequest,
  DeleteCustomExtensionRequest,
  ApiError,
  ApiErrorCode,
  EXTENSION_CONSTANTS,
} from '../types/api'

export interface IExtensionService {
  getAllExtensions(): Promise<ExtensionsResponse>
  updateFixedExtension(
    request: UpdateFixedExtensionRequest,
  ): Promise<FixedExtensionDB>
  createCustomExtension(
    request: CreateCustomExtensionRequest,
  ): Promise<CustomExtensionDB>
  deleteCustomExtension(request: DeleteCustomExtensionRequest): Promise<void>
}

export class ExtensionService implements IExtensionService {
  constructor(private repository: IExtensionRepository = extensionRepository) {}

  async getAllExtensions(): Promise<ExtensionsResponse> {
    try {
      const [fixed, custom] = await Promise.all([
        this.repository.getAllFixed(),
        this.repository.getAllCustom(),
      ])

      return { fixed, custom }
    } catch (error) {
      if (this.isApiError(error)) throw error
      throw this.createServiceError(
        ApiErrorCode.INTERNAL_ERROR,
        '확장자 목록 조회 중 오류가 발생했습니다',
        error,
      )
    }
  }

  async updateFixedExtension(
    request: UpdateFixedExtensionRequest,
  ): Promise<FixedExtensionDB> {
    this.validateFixedExtensionRequest(request)

    try {
      return await this.repository.updateFixed(request.name, request.blocked)
    } catch (error) {
      if (this.isApiError(error)) throw error
      throw this.createServiceError(
        ApiErrorCode.INTERNAL_ERROR,
        '고정 확장자 업데이트 중 오류가 발생했습니다',
        error,
      )
    }
  }

  async createCustomExtension(
    request: CreateCustomExtensionRequest,
  ): Promise<CustomExtensionDB> {
    await this.validateCustomExtensionRequest(request)

    try {
      return await this.repository.createCustom(request.name)
    } catch (error) {
      if (this.isApiError(error)) throw error
      throw this.createServiceError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 생성 중 오류가 발생했습니다',
        error,
      )
    }
  }

  async deleteCustomExtension(
    request: DeleteCustomExtensionRequest,
  ): Promise<void> {
    this.validateDeleteRequest(request)

    try {
      await this.repository.deleteCustom(request.name)
    } catch (error) {
      if (this.isApiError(error)) throw error
      throw this.createServiceError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 삭제 중 오류가 발생했습니다',
        error,
      )
    }
  }

  private validateFixedExtensionRequest(
    request: UpdateFixedExtensionRequest,
  ): void {
    if (!request.name || typeof request.name !== 'string') {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름이 필요합니다',
      )
    }

    if (typeof request.blocked !== 'boolean') {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '차단 상태는 boolean 값이어야 합니다',
      )
    }

    if (request.name.trim().length === 0) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름은 비어있을 수 없습니다',
      )
    }

    if (request.name.length > EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        `확장자 이름은 ${EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH}자를 초과할 수 없습니다`,
      )
    }
  }

  private async validateCustomExtensionRequest(
    request: CreateCustomExtensionRequest,
  ): Promise<void> {
    if (!request.name || typeof request.name !== 'string') {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름이 필요합니다',
      )
    }

    const trimmedName = request.name.trim().toLowerCase()

    if (trimmedName.length === 0) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름은 비어있을 수 없습니다',
      )
    }

    if (trimmedName.length < EXTENSION_CONSTANTS.MIN_EXTENSION_LENGTH) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        `확장자 이름은 최소 ${EXTENSION_CONSTANTS.MIN_EXTENSION_LENGTH}자 이상이어야 합니다`,
      )
    }

    if (trimmedName.length > EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        `확장자 이름은 ${EXTENSION_CONSTANTS.MAX_EXTENSION_LENGTH}자를 초과할 수 없습니다`,
      )
    }

    if (!/^[a-z0-9]+$/.test(trimmedName)) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름은 영문 소문자와 숫자만 사용할 수 있습니다',
      )
    }

    const currentCount = await this.repository.getCustomCount()
    if (currentCount >= EXTENSION_CONSTANTS.MAX_CUSTOM_EXTENSIONS) {
      throw this.createServiceError(
        ApiErrorCode.BAD_REQUEST,
        `커스텀 확장자는 최대 ${EXTENSION_CONSTANTS.MAX_CUSTOM_EXTENSIONS}개까지만 추가할 수 있습니다`,
      )
    }

    const fixedExtensions = await this.repository.getAllFixed()
    const isFixedExtension = fixedExtensions.some(
      (ext) => ext.name.toLowerCase() === trimmedName,
    )

    if (isFixedExtension) {
      throw this.createServiceError(
        ApiErrorCode.CONFLICT,
        '고정 확장자와 동일한 이름은 사용할 수 없습니다',
      )
    }

    const existingCustom = await this.repository.findCustomByName(trimmedName)
    if (existingCustom) {
      throw this.createServiceError(
        ApiErrorCode.CONFLICT,
        '이미 존재하는 커스텀 확장자입니다',
      )
    }

    request.name = trimmedName
  }

  private validateDeleteRequest(request: DeleteCustomExtensionRequest): void {
    if (!request.name || typeof request.name !== 'string') {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '삭제할 확장자 이름이 필요합니다',
      )
    }

    if (request.name.trim().length === 0) {
      throw this.createServiceError(
        ApiErrorCode.VALIDATION_ERROR,
        '확장자 이름은 비어있을 수 없습니다',
      )
    }
  }

  private createServiceError(
    code: ApiErrorCode,
    message: string,
    originalError?: any,
  ): ApiError {
    return {
      code,
      message,
      details: originalError?.message || originalError,
    }
  }

  private isApiError(error: any): error is ApiError {
    return (
      error &&
      typeof error.code === 'string' &&
      typeof error.message === 'string'
    )
  }
}

export const extensionService = new ExtensionService()
