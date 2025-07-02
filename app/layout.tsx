import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | Extension Filter',
    default: 'Extension Filter',
  },
  description: '파일 확장자별로 업로드를 제한하는 관리 시스템',
  keywords: ['file extension', 'upload filter', 'security', 'file management'],
  authors: [{ name: 'Extension Filter Team' }],
  openGraph: {
    title: 'Extension Filter',
    description: '파일 확장자별로 업로드를 제한하는 관리 시스템',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <main>{children}</main>
      </body>
    </html>
  )
}
