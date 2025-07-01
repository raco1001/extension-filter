import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { fixedExtensions, customExtensions } from '@/lib/db/schema'
import {
  FixedExtensionDB,
  CustomExtensionDB,
  ApiError,
  ApiErrorCode,
} from '../types/api'

export interface IExtensionRepository {
  // Fixed Extensions
  getAllFixed(): Promise<FixedExtensionDB[]>
  updateFixed(name: string, blocked: boolean): Promise<FixedExtensionDB>
  createFixed(name: string, blocked: boolean): Promise<FixedExtensionDB>

  // Custom Extensions
  getAllCustom(): Promise<CustomExtensionDB[]>
  createCustom(name: string): Promise<CustomExtensionDB>
  deleteCustom(name: string): Promise<void>
  findCustomByName(name: string): Promise<CustomExtensionDB | null>
  getCustomCount(): Promise<number>
}

export class ExtensionRepository implements IExtensionRepository {
  async getAllFixed(): Promise<FixedExtensionDB[]> {
    try {
      return await db.select().from(fixedExtensions)
    } catch (error) {
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '고정 확장자 조회 실패',
        error,
      )
    }
  }

  async updateFixed(name: string, blocked: boolean): Promise<FixedExtensionDB> {
    try {
      const existing = await this.findFixedByName(name)

      if (existing) {
        const [updated] = await db
          .update(fixedExtensions)
          .set({ blocked })
          .where(eq(fixedExtensions.name, name))
          .returning()
        return updated
      } else {
        return await this.createFixed(name, blocked)
      }
    } catch (error) {
      if (this.isRepositoryError(error)) throw error
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '고정 확장자 업데이트 실패',
        error,
      )
    }
  }

  async createFixed(name: string, blocked: boolean): Promise<FixedExtensionDB> {
    try {
      const [created] = await db
        .insert(fixedExtensions)
        .values({ name, blocked })
        .returning()
      return created
    } catch (error) {
      if (this.isDuplicateError(error)) {
        throw this.createRepositoryError(
          ApiErrorCode.CONFLICT,
          '이미 존재하는 고정 확장자입니다',
        )
      }
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '고정 확장자 생성 실패',
        error,
      )
    }
  }

  private async findFixedByName(
    name: string,
  ): Promise<FixedExtensionDB | null> {
    const result = await db
      .select()
      .from(fixedExtensions)
      .where(eq(fixedExtensions.name, name))
      .limit(1)

    return result[0] || null
  }

  async getAllCustom(): Promise<CustomExtensionDB[]> {
    try {
      return await db.select().from(customExtensions)
    } catch (error) {
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 조회 실패',
        error,
      )
    }
  }

  async createCustom(name: string): Promise<CustomExtensionDB> {
    try {
      const [created] = await db
        .insert(customExtensions)
        .values({ name })
        .returning()
      return created
    } catch (error) {
      if (this.isDuplicateError(error)) {
        throw this.createRepositoryError(
          ApiErrorCode.CONFLICT,
          '이미 존재하는 확장자입니다',
        )
      }
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 생성 실패',
        error,
      )
    }
  }

  async deleteCustom(name: string): Promise<void> {
    try {
      const result = await db
        .delete(customExtensions)
        .where(eq(customExtensions.name, name))
        .returning()

      if (result.length === 0) {
        throw this.createRepositoryError(
          ApiErrorCode.NOT_FOUND,
          '삭제할 확장자를 찾을 수 없습니다',
        )
      }
    } catch (error) {
      if (this.isRepositoryError(error)) throw error
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 삭제 실패',
        error,
      )
    }
  }

  async findCustomByName(name: string): Promise<CustomExtensionDB | null> {
    try {
      const result = await db
        .select()
        .from(customExtensions)
        .where(eq(customExtensions.name, name))
        .limit(1)

      return result[0] || null
    } catch (error) {
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 조회 실패',
        error,
      )
    }
  }

  async getCustomCount(): Promise<number> {
    try {
      const result = await db.select().from(customExtensions)
      return result.length
    } catch (error) {
      throw this.createRepositoryError(
        ApiErrorCode.INTERNAL_ERROR,
        '커스텀 확장자 개수 조회 실패',
        error,
      )
    }
  }

  private createRepositoryError(
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

  private isRepositoryError(error: any): error is ApiError {
    return (
      error &&
      typeof error.code === 'string' &&
      typeof error.message === 'string'
    )
  }

  private isDuplicateError(error: any): boolean {
    return error?.code === '23505' // PostgreSQL unique violation
  }
}

export const extensionRepository = new ExtensionRepository()
