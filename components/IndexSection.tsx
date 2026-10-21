'use client'

import { useState } from 'react'
import type { Note } from '@/types/database'
import { T } from '@/lib/theme'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '로그': 'Log', '습작': 'Study', '회고': 'Retro', '일상': 'Daily' }
const TYPE_ORDER = ['노트', '로그', '습작', '회고', '일상']
// 타입 배지 고정 폭 — 가장 긴 라벨(Retro, Study) 기준
const TYPE_BADGE_W = 48

interface Props {
  notes: Note[]
  onOpenNote: (index: number) => void
}

export default function IndexSection({ notes, onOpenNote }: Props) {
  const [filter, setFilter] = useState('전체')
  const tabs = ['전체', ...TYPE_ORDER.filter(t => notes.some(n => n.type === t))]

  const filtered = filter === '전체' ? notes : notes.filter(n => n.type === filter)

  const tabBase: React.CSSProperties = {
    fontFamily: "'SUIT Variable',-apple-system,sans-serif",
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 16px',
    borderRadius: 8,
    border: `1px solid ${T.btnBorder}`,
    background: 'transparent',
    color: T.text,
    cursor: 'pointer',
    transition: '.18s',
    whiteSpace: 'nowrap',
  }
  const tabActive: React.CSSProperties = {
    ...tabBase,
    // 선택 탭은 반전 (어두운 배경 + 밝은 글자)
    background: '#231F1A',
    color: '#FDFBF7',
    border: '1px solid #231F1A',
    fontWeight: 700,
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={t === filter ? tabActive : tabBase}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: T.textGhost, padding: '0 14px 10px', borderBottom: `1px solid ${T.hairlineStrong}` }}>
        <span>DATE / TITLE</span><span style={{ width: TYPE_BADGE_W, textAlign: 'center' }}>TYPE</span>
      </div>
      {filtered.map((note, i) => (
        <button
          key={note.id}
          onClick={() => onOpenNote(notes.indexOf(note))}
          className="hover-accent"
          style={{
            width: '100%',
            textAlign: 'left',
            border: 0,
            borderBottom: `1px solid ${T.hairline}`,
            padding: '14px 14px',
            cursor: 'pointer',
            color: T.text,
            display: 'grid',
            gridTemplateColumns: '96px 1fr auto',
            gap: 14,
            alignItems: 'center',
            transition: 'background .15s,color .15s',
            background: 'transparent',
          }}
        >
          <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'currentColor', opacity: .55 }}>{note.date}</span>
          <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, fontWeight: 600, color: 'currentColor', opacity: .92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note.title}
            {/* 비공개 마커 — 관리자 세션에서만 노출되는 글 */}
            {note.private && <span aria-label="비공개" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#FF6D19', marginLeft: 3, verticalAlign: 'text-top' }} />}
          </span>
          {/* 타입 배지: 글자 70% / 테두리 50% (배지 opacity .7 × 테두리 71% ≈ 50%, hover 시 currentColor 따라 같이 바뀜) */}
          <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 600, color: 'currentColor', opacity: .7, border: '1px solid color-mix(in srgb, currentColor 71%, transparent)', borderRadius: 5, padding: '3px 0', whiteSpace: 'nowrap', width: TYPE_BADGE_W, boxSizing: 'border-box', textAlign: 'center' }}>
            {TYPE_EN[note.type] || note.type}
          </span>
        </button>
      ))}
    </div>
  )
}
