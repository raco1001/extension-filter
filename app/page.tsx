import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/extensions')
}

export const metadata = {
  title: 'Extension Filter',
  description: '파일 확장자별로 업로드를 제한하는 관리 시스템',
}
