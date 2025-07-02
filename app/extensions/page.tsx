import { Suspense } from 'react'
import { getAllExtensions } from '@/lib/supabase/queries'
import { ExtensionsClient } from '@/app/extensions/components/ExtensionsClient'
import { LoadingSkeleton } from '@/app/extensions/components/LoadingSkeleton'

export default async function ExtensionsPage() {
  // 서버에서 직접 데이터 페칭 (API 레이어 생략)
  const initialData = await getAllExtensions()

  return (
    <div className="container mx-auto p-8 max-w-2xl bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">파일 확장자 차단</h1>

      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <p className="mb-6 text-gray-600">
          파일확장자에 따라 특정 형식의 파일을 첨부하거나 전송하지 못하도록 제한
        </p>

        <Suspense fallback={<LoadingSkeleton />}>
          <ExtensionsClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  )
}

// 메타데이터 정의
export const metadata = {
  title: '파일 확장자 차단 | Extension Filter',
  description: '파일 확장자별로 업로드를 제한하는 관리 시스템',
}
