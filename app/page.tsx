'use client'

import { useEffect, useState } from 'react'
import {
  CustomExtensions,
  ICustomExtension,
} from './components/extensions/CustomExtensions'
import {
  FixedExtensions,
  IFixedExtension,
} from './components/extensions/FixedExtensions'

export default function Home() {
  const [fixed, setFixed] = useState<IFixedExtension[]>([])
  const [custom, setCustom] = useState<ICustomExtension[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExtensions()
  }, [])

  const fetchExtensions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/extensions')
      if (!res.ok) throw new Error('확장자 목록을 불러오는데 실패했습니다.')

      const response = await res.json()
      const data = response.data || response // API 응답 구조에 맞게 처리

      setFixed(
        (data.fixed || []).map((ext: IFixedExtension) => ({
          id: ext.id,
          name: ext.name,
          blocked: ext.blocked,
          readonly: true as const,
        })),
      )

      setCustom(data.custom || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFixedToggle = async (
    name: string,
    blocked: boolean,
  ): Promise<void> => {
    setFixed((prev) =>
      prev.map((ext) => (ext.name === name ? { ...ext, blocked } : ext)),
    )

    try {
      const res = await fetch('/api/extensions/fixed', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, blocked }),
      })

      if (!res.ok) {
        setFixed((prev) =>
          prev.map((ext) =>
            ext.name === name ? { ...ext, blocked: !blocked } : ext,
          ),
        )
        throw new Error('설정 변경에 실패했습니다.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '설정 변경 중 오류가 발생했습니다.',
      )
      throw err
    }
  }

  const handleAddCustom = async (extensionName: string): Promise<void> => {
    const res = await fetch('/api/extensions/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: extensionName }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || '확장자 추가에 실패했습니다.')
    }

    const response = await res.json()
    const added = response.data || response
    if (added) {
      setCustom((prev) => [...prev, added])
    }
  }

  const handleDeleteCustom = async (extensionName: string): Promise<void> => {
    const res = await fetch('/api/extensions/custom', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: extensionName }),
    })

    if (!res.ok) {
      const { error } = await res.json()
      throw new Error(error || '확장자 삭제에 실패했습니다.')
    }

    setCustom((prev) => prev.filter((ext) => ext.name !== extensionName))
  }

  return (
    <Container>
      <PageTitle>파일 확장자 차단</PageTitle>
      <Card>
        <Description>
          파일확장자에 따라 특정 형식의 파일을 첨부하거나 전송하지 못하도록 제한
        </Description>

        {error && (
          <ErrorBanner>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-800 hover:text-red-900"
            >
              ✕
            </button>
          </ErrorBanner>
        )}

        <FixedExtensions
          extensions={fixed}
          onToggle={handleFixedToggle}
          isLoading={isLoading}
          error={null}
        />

        <CustomExtensions
          extensions={custom}
          fixedExtensions={fixed.map((ext) => ext.name)}
          onAdd={handleAddCustom}
          onDelete={handleDeleteCustom}
          isLoading={isLoading}
          error={null}
        />
      </Card>
    </Container>
  )
}

const Container = ({ children }: { children: React.ReactNode }) => (
  <div className="container mx-auto p-8 max-w-2xl bg-gray-50 min-h-screen">
    {children}
  </div>
)

const PageTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className="text-2xl font-bold mb-4">{children}</h1>
)

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
    {children}
  </div>
)

const Description = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-6 text-gray-600">{children}</p>
)

const ErrorBanner = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center justify-between">
    {children}
  </div>
)
