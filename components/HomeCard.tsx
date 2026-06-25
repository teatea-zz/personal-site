'use client'

import { ArrowUpRight } from 'lucide-react'
import type { Note } from '@/types/database'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log', '회고': 'Retro', '일상': 'Daily' }

interface Props {
  recentNotes: Note[]
  onOpenNote: (i: number) => void
  onOpenView: (v: string) => void
}

export default function HomeCard({ recentNotes, onOpenNote, onOpenView }: Props) {
  return (
    <div style={{ position: 'relative', zIndex: 3, width: 'min(100%,548px)' }}>
      <div style={{
        background: 'rgba(15,15,15,.6)',
        backdropFilter: 'blur(22px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.1)',
        border: '1px solid rgba(255,255,255,.12)',
        borderRadius: 14,
        padding: 'clamp(20px,5.5vw,30px)',
        color: '#f4f4f1',
        boxShadow: '0 34px 90px -34px rgba(0,0,0,.75)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, textTransform: 'uppercase', color: 'rgba(244,244,241,.5)' }}>Portfolio + Notes</span>
          <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'rgba(244,244,241,.5)' }}>© 2026</span>
        </div>

        <h1 style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", fontWeight: 700, fontSize: 'clamp(50px,17.5vw,96px)', lineHeight: 1, letterSpacing: '-.045em', margin: '14px 0 0', whiteSpace: 'nowrap', color: '#f6f6f3' }}>Jihyun Kim</h1>

        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13.5, fontWeight: 400, lineHeight: 1.65, color: 'rgba(244,244,241,.66)', margin: '16px 0 2px', maxWidth: '44ch' }}>
          디자이너이자 영원한 학생.<br />
          완성한 작업 곁에 습작과 초고, 매일의 기록을 함께 둡니다<br />
          — 원래 그렇게 만들어지니까요.
        </p>

        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,.1)' }}>
          {recentNotes.map((note, i) => (
            <button
              key={note.id}
              onClick={() => onOpenNote(i)}
              className="hover-accent"
              style={{
                width: '100%',
                textAlign: 'left',
                border: 0,
                borderBottom: '1px solid rgba(255,255,255,.1)',
                padding: '13px 14px',
                cursor: 'pointer',
                display: 'block',
                color: '#f4f4f1',
                transition: 'background .15s,color .15s',
                background: 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: "'Geist',ui-monospace,monospace",
                  fontSize: 12, fontWeight: 600,
                  color: 'currentColor',
                  opacity: note.private ? .55 : .96,
                  textDecoration: note.private ? 'line-through' : undefined,
                }}>{note.date}</span>
                <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, color: 'currentColor', opacity: .5 }}>
                  {TYPE_EN[note.type] || note.type}
                </span>
              </div>
              <div style={{
                fontFamily: "'SUIT Variable',sans-serif",
                fontSize: 14, fontWeight: 600, marginTop: 5,
                color: 'currentColor',
                opacity: note.private ? .55 : .9,
                textDecoration: note.private ? 'line-through' : undefined,
              }}>{note.title}</div>
              <div style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, marginTop: 2, color: 'currentColor', opacity: .5 }}>{note.sub}</div>
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
                border: '1px solid rgba(255,255,255,.22)',
                color: '#f4f4f1',
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

        <div style={{ marginTop: 16, fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'rgba(244,244,241,.36)' }}>
          UPDATED 2026.06.12 — SEOUL, KR
        </div>
      </div>
    </div>
  )
}
