'use client'

import { ArrowUpRight } from 'lucide-react'
import type { Note } from '@/types/database'
import { T } from '@/lib/theme'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log', '회고': 'Retro', '일상': 'Daily' }

interface Props {
  recentNotes: Note[]
  onOpenNote: (i: number) => void
  onOpenView: (v: string) => void
}

export default function HomeCard({ recentNotes, onOpenNote, onOpenView }: Props) {
  return (
    <div style={{ position: 'relative', zIndex: 3, width: 'min(100%,448px)' }}>
      <div style={{
        background: T.heroBg,
        backdropFilter: 'blur(22px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.1)',
        border: `1px solid ${T.heroBorder}`,
        borderRadius: 14,
        padding: 'clamp(20px,5.5vw,24px)',
        color: T.heroText,
        boxShadow: T.heroShadow,
      }}>
        <h1 style={{ fontFamily: "'Geist',ui-monospace,monospace", fontWeight: 800, fontSize: 'clamp(50px,17.5vw,96px)', lineHeight: 1, letterSpacing: '-.02em', margin: 0, whiteSpace: 'nowrap', color: '#FF5E19' }}>lalahyun</h1>

        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13.5, fontWeight: 450, lineHeight: 1.65, color: T.heroTextDim, margin: '16px 0 4px', maxWidth: '44ch' }}>
          UX/UI Designer, Builder<br />
          에이전트 코딩으로, 프론트엔드 구현까지 함께 만들어갑니다.<br />
          ㅡ 첫 정식 서비스: SamePage '우리는 지금 같은 페이지에 있네요'
        </p>

        <div style={{ marginTop: 16, borderTop: `1px solid ${T.heroHairline}` }}>
          {recentNotes.map((note, i) => (
            <button
              key={note.id}
              onClick={() => onOpenNote(i)}
              className="hover-accent"
              style={{
                width: '100%',
                textAlign: 'left',
                border: 0,
                borderBottom: `1px solid ${T.heroHairline}`,
                padding: '13px 14px',
                cursor: 'pointer',
                display: 'block',
                color: T.heroText,
                transition: 'background .15s,color .15s',
                background: 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: "'Geist',ui-monospace,monospace",
                  fontSize: 12, fontWeight: 500,
                  color: 'currentColor',
                  opacity: .96,
                }}>{note.date}</span>
                <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 450, color: 'currentColor', opacity: .5 }}>
                  {TYPE_EN[note.type] || note.type}
                </span>
              </div>
              <div style={{
                fontFamily: "'SUIT Variable',sans-serif",
                fontSize: 14, fontWeight: 600, marginTop: 5,
                color: 'currentColor',
                opacity: .9,
              }}>
                {note.title}
                {/* 비공개 마커 — 관리자 세션에서만 노출되는 글 */}
                {note.private && <span aria-label="비공개" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#FF6D19', marginLeft: 3, verticalAlign: 'text-top' }} />}
              </div>
              <div style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 500, marginTop: 2, color: 'currentColor', opacity: .5 }}>{note.sub}</div>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          {(['work', 'about', 'contact', 'index'] as const).map(v => (
            <button
              key={v}
              onClick={() => onOpenView(v)}
              className="hover-accent-border"
              style={{
                appearance: 'none',
                border: `1px solid ${T.heroBtnBorder}`,
                color: T.heroBtnText,
                fontFamily: "'Geist',ui-monospace,monospace",
                fontSize: 14,
                fontWeight: 400,
                textTransform: 'uppercase',
                padding: 13,
                borderRadius: 13,
                cursor: 'pointer',
                transition: '.18s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
              }}
            >
              <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: T.heroGhost }}>
          © lalahyun 2026
        </div>
      </div>
    </div>
  )
}
