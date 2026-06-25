import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Jihyun Kim',
  description: '디자이너이자 영원한 학생 — 포트폴리오 + 노트',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  )
}
