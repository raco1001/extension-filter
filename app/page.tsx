'use client'

import { useEffect, useState } from 'react'

const FIXED_EXTENSIONS = ['bat', 'cmd', 'com', 'cpl', 'exe', 'scr', 'js']

type CustomExtension = {
  id: number
  name: string
}

type FixedExtension = {
  id: number
  name: string
  blocked: boolean
}

export default function Home() {
  const [fixed, setFixed] = useState<Record<string, boolean>>({})
  const [custom, setCustom] = useState<CustomExtension[]>([])
  const [newExtension, setNewExtension] = useState('')

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/extensions')
      const data = await res.json()

      const fixedData: Record<string, boolean> = {}
      data.fixed.forEach((ext: FixedExtension) => {
        fixedData[ext.name] = ext.blocked
      })
      setFixed(fixedData)

      setCustom(data.custom)
    }
    fetchData()
  }, [])

  const handleFixedChange = async (name: string, blocked: boolean) => {
    setFixed((prev) => ({ ...prev, [name]: blocked }))
    await fetch('/api/extensions/fixed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, blocked }),
    })
  }

  const handleAddCustom = async () => {
    const trimmed = newExtension.trim().toLowerCase()
    if (!trimmed) return
    if (trimmed.length > 20) {
      alert('확장자는 최대 20자까지 입력할 수 있습니다.')
      return
    }
    if (custom.length >= 200) {
      alert('커스텀 확장자는 최대 200개까지 추가할 수 있습니다.')
      return
    }
    if (
      custom.some((ext) => ext.name === trimmed) ||
      FIXED_EXTENSIONS.includes(trimmed)
    ) {
      alert('이미 등록된 확장자입니다.')
      return
    }

    const res = await fetch('/api/extensions/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })

    if (res.ok) {
      const added = await res.json()
      setCustom((prev) => [...prev, added])
      setNewExtension('')
    } else {
      const { error } = await res.json()
      alert(error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // form의 기본 제출 동작 방지
      handleAddCustom()
    }
  }

  const handleDeleteCustom = async (name: string) => {
    setCustom((prev) => prev.filter((ext) => ext.name !== name))
    await fetch('/api/extensions/custom', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">파일 확장자 차단</h1>
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="mb-6 text-gray-600">
          파일확장자에 따라 특정 형식의 파일을 첨부하거나 전송하지 못하도록 제한
        </p>

        {/* 고정 확장자 */}
        <div className="mb-6">
          <h2 className="font-semibold text-gray-700 mb-2">고정 확장자</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {FIXED_EXTENSIONS.map((ext) => (
              <label
                key={ext}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={!!fixed[ext]}
                  onChange={(e) => handleFixedChange(ext, e.target.checked)}
                />
                <span className="text-gray-800">{ext}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 커스텀 확장자 */}
        <div>
          <h2 className="font-semibold text-gray-700 mb-2">커스텀 확장자</h2>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newExtension}
              onChange={(e) => setNewExtension(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={20}
              placeholder="확장자 입력"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              + 추가
            </button>
          </div>
          <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[120px]">
            <div className="flex flex-wrap gap-2">
              {custom.map((ext) => (
                <div
                  key={ext.id}
                  className="flex items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-2.5 py-1 rounded-full"
                >
                  <span>{ext.name}</span>
                  <button
                    onClick={() => handleDeleteCustom(ext.name)}
                    className="ml-2 text-indigo-500 hover:text-indigo-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <p className="text-right text-sm text-gray-500 mt-2 pr-1">
              {custom.length}/200
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
