// RPC 클라이언트는 현재 타입 이슈로 인해 주석 처리
// import { hc } from 'hono/client'

// 에러 핸들링 유틸리티
export const handleApiError = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP Error: ${response.status}`)
  }
  return response
}

// 타입 안전한 API 클라이언트 함수들 (fetch 기반)
export const extensionsApi = {
  // 모든 확장자 조회
  async getAll() {
    const response = await fetch('/api/extensions')
    await handleApiError(response)
    return response.json()
  },

  // 고정 확장자 업데이트
  async updateFixed(data: { name: string; blocked: boolean }) {
    const response = await fetch('/api/extensions/fixed', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },

  // 커스텀 확장자 생성
  async createCustom(data: { name: string }) {
    const response = await fetch('/api/extensions/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },

  // 커스텀 확장자 삭제
  async deleteCustom(data: { name: string }) {
    const response = await fetch('/api/extensions/custom', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },
}

// 헬스 체크 API
export const healthApi = {
  async check() {
    const response = await fetch('/api/health')
    await handleApiError(response)
    return response.json()
  },
}

// fetch 기반 대체 클라이언트 (호환성 유지용)
export const fetchApi = {
  async getExtensions() {
    const response = await fetch('/api/extensions')
    await handleApiError(response)
    return response.json()
  },

  async updateFixedExtension(data: { name: string; blocked: boolean }) {
    const response = await fetch('/api/extensions/fixed', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },

  async createCustomExtension(data: { name: string }) {
    const response = await fetch('/api/extensions/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },

  async deleteCustomExtension(data: { name: string }) {
    const response = await fetch('/api/extensions/custom', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    await handleApiError(response)
    return response.json()
  },
}
