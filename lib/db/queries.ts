import { db } from './index'
import { customExtensions, fixedExtensions } from './schema'
import { eq, count } from 'drizzle-orm'
import type {
  FixedExtensionDB,
  CustomExtensionDB,
  ExtensionsResponse,
} from '@/lib/api/types'

// Extensions 조회
export async function getExtensions(): Promise<ExtensionsResponse> {
  const [fixed, custom] = await Promise.all([
    getFixedExtensions(),
    getCustomExtensions(),
  ])

  return { fixed, custom }
}

export async function getFixedExtensions(): Promise<FixedExtensionDB[]> {
  return await db.select().from(fixedExtensions)
}

export async function getCustomExtensions(): Promise<CustomExtensionDB[]> {
  return await db.select().from(customExtensions)
}

// Fixed Extension 업데이트
export async function updateFixedExtension(
  name: string,
  blocked: boolean,
): Promise<FixedExtensionDB> {
  const [updated] = await db
    .update(fixedExtensions)
    .set({ blocked })
    .where(eq(fixedExtensions.name, name))
    .returning()

  if (!updated) {
    throw new Error(`고정 확장자 "${name}"을 찾을 수 없습니다`)
  }

  return updated
}

// Custom Extension 생성
export async function createCustomExtension(
  name: string,
): Promise<CustomExtensionDB> {
  // 중복 체크
  const existing = await findCustomExtensionByName(name)
  if (existing) {
    throw new Error('이미 존재하는 커스텀 확장자입니다')
  }

  // 고정 확장자와 중복 체크
  const fixedExts = await getFixedExtensions()
  const isFixedExtension = fixedExts.some(
    (ext) => ext.name.toLowerCase() === name.toLowerCase(),
  )
  if (isFixedExtension) {
    throw new Error('고정 확장자와 동일한 이름은 사용할 수 없습니다')
  }

  // 개수 제한 체크
  const currentCount = await getCustomExtensionCount()
  if (currentCount >= 200) {
    throw new Error('커스텀 확장자는 최대 200개까지만 추가할 수 있습니다')
  }

  const [created] = await db
    .insert(customExtensions)
    .values({ name: name.toLowerCase() })
    .returning()

  return created
}

// Custom Extension 삭제
export async function deleteCustomExtension(name: string): Promise<void> {
  const result = await db
    .delete(customExtensions)
    .where(eq(customExtensions.name, name.toLowerCase()))
    .returning()

  if (result.length === 0) {
    throw new Error(`커스텀 확장자 "${name}"을 찾을 수 없습니다`)
  }
}

// 헬퍼 함수들
export async function findCustomExtensionByName(
  name: string,
): Promise<CustomExtensionDB | null> {
  const [found] = await db
    .select()
    .from(customExtensions)
    .where(eq(customExtensions.name, name.toLowerCase()))
    .limit(1)

  return found || null
}

export async function getCustomExtensionCount(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(customExtensions)

  return result?.count || 0
}

// 타입 가드 및 에러 처리 유틸리티
export function createDbError(message: string, originalError?: any): Error {
  console.error('Database Error:', message, originalError)
  return new Error(message)
}
