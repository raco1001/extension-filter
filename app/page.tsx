import { redirect } from 'next/navigation'

export default function HomePage() {
  // 홈페이지에서 extensions 페이지로 리다이렉트
  redirect('/extensions')
}

// 메타데이터 정의
export const metadata = {
  title: 'Extension Filter',
  description: '파일 확장자별로 업로드를 제한하는 관리 시스템',
}
