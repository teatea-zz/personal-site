'use client'

import { ArrowUpRight } from 'lucide-react'
import { T } from '@/lib/theme'

export default function ContactSection() {
  const links = [
    { label: 'Instagram', handle: '@lalahyun', href: 'https://instagram.com/lalahyun' },
    { label: 'GitHub', handle: '/lalahyun', href: 'https://github.com/lalahyun' },
    { label: 'Email', handle: 'lalahyun.d@gmail.com', href: 'mailto:lalahyun.d@gmail.com' },
  ]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, fontWeight: 400, lineHeight: 1.7, color: T.textDim, margin: '0 0 26px', maxWidth: '40ch' }}>
        함께 일하거나, 노트를 나누거나, 느린 편지를 — 편하게 인사 건네 주세요.
      </p>
      {links.map(({ label, handle, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener' : undefined}
          className="hover-accent"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 16,
            borderBottom: `1px solid ${T.hairlineStrong}`,
            padding: '18px 14px',
            textDecoration: 'none',
            color: T.text,
            transition: '.18s',
          }}
        >
          <span style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 700, fontSize: 'clamp(24px,3.4vw,34px)', letterSpacing: '-.02em', color: 'currentColor' }}>{label}</span>
          <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 14, color: 'currentColor', opacity: .62, display: 'flex', alignItems: 'center', gap: 4 }}>
            {handle}<ArrowUpRight size={16} strokeWidth={1.5} />
          </span>
        </a>
      ))}
    </div>
  )
}
