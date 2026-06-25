'use client'

import { ArrowUpRight } from 'lucide-react'
import type { Work } from '@/types/database'

const IMG_FILTER = 'grayscale(.15) sepia(.18) saturate(.82) contrast(1.05) brightness(.9)'

interface Props {
  works: Work[]
  onOpen: (index: number) => void
}

export default function WorkGrid({ works, onOpen }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 'clamp(14px,2vw,24px)',
      maxWidth: 1080,
      margin: '0 auto',
    }}
      className="work-grid"
    >
      {works.map((w, i) => (
        <button
          key={w.id}
          onClick={() => onOpen(i)}
          style={{ width: '100%', textAlign: 'left', border: 0, padding: 0, cursor: 'pointer', color: 'inherit', display: 'block', background: 'transparent' }}
        >
          <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: '#1a1a1a' }}>
            <div
              className="card-img"
              style={{
                width: '100%', height: '100%',
                backgroundImage: `url("${w.img}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: IMG_FILTER,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, marginTop: 11 }}>
            <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, fontWeight: 700, color: '#f2f2ee' }}>{w.title}</span>
            <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'rgba(244,244,241,.4)' }}>{w.tag}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
            <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, color: 'rgba(244,244,241,.52)' }}>{w.role} · {w.year}</span>
            <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, fontWeight: 500, color: 'rgba(244,244,241,.7)', display: 'flex', alignItems: 'center', gap: 3 }}>View <ArrowUpRight size={16} strokeWidth={1.5} /></span>
          </div>
        </button>
      ))}
      <style>{`@media (max-width:640px) { .work-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
