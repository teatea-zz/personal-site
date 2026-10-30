'use client'

import { ArrowRight } from 'lucide-react'
import type { Work } from '@/types/database'
import { T } from '@/lib/theme'

interface Props {
  works: Work[]
  onOpen: (index: number) => void
}

export default function WorkGrid({ works, onOpen }: Props) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 'clamp(var(--space-16),2vw,var(--space-24))',
      maxWidth: 1080,
      margin: '0 auto',
    }}
      className="work-grid"
    >
      {works.map((w, i) => (
        <button
          key={w.id}
          onClick={() => onOpen(i)}
          className="work-card"
          style={{ width: '100%', textAlign: 'left', border: 0, padding: 0, cursor: 'pointer', color: 'inherit', display: 'block', background: 'transparent' }}
        >
          <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 'var(--radius-12)', border: `1px solid ${T.hairline}`, background: T.imgWell }}>
            <div
              className="card-img"
              style={{
                width: '100%', height: '100%',
                backgroundImage: `url("${w.img}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          {/* 제목은 한 줄 — 넘치면 말줄임 (전체 제목은 title 툴팁 / 상세 페이지) */}
          <div title={w.title} className="work-card-title" style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 24, fontWeight: 700, color: T.heading, marginTop: 'var(--space-12)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {w.title}
            {/* 비공개 마커 — 관리자 세션에서만 노출되는 작업물 (노트와 동일) */}
            {w.private && <span aria-label="비공개" style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#FF6D19', marginLeft: 'var(--space-4)', verticalAlign: 'super' }} />}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-12)', marginTop: 'var(--space-4)' }}>
            <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13, fontWeight: 500, color: T.textDim }}>{w.role} · {w.year}</span>
            <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, fontWeight: 500, color: T.textDim, display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexShrink: 0 }}>View <ArrowRight size={16} strokeWidth={1.5} /></span>
          </div>
        </button>
      ))}
      <style>{`@media (max-width:640px) { .work-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
