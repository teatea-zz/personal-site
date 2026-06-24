'use client'

export default function ContactSection() {
  const links = [
    { label: 'Instagram', handle: '@hanjiwoo ↗', href: 'https://instagram.com/hanjiwoo' },
    { label: 'GitHub', handle: '/hanjiwoo ↗', href: 'https://github.com/hanjiwoo' },
    { label: 'Email', handle: 'hanjiwoo@gmail.com ↗', href: 'mailto:hanjiwoo@gmail.com' },
  ]

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 14.5, lineHeight: 1.7, color: 'rgba(244,244,241,.55)', margin: '0 0 26px', maxWidth: '40ch' }}>
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
            borderBottom: '1px solid rgba(255,255,255,.14)',
            padding: '18px 14px',
            textDecoration: 'none',
            color: '#f4f4f1',
            transition: '.18s',
          }}
        >
          <span style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 700, fontSize: 'clamp(24px,3.4vw,34px)', letterSpacing: '-.02em', color: 'currentColor' }}>{label}</span>
          <span style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 13, color: 'currentColor', opacity: .6 }}>{handle}</span>
        </a>
      ))}
    </div>
  )
}
