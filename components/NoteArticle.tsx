'use client'

import type { Note } from '@/types/database'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log' }

interface Props {
  note: Note
  noteNum: string
  onOpenIndex: () => void
}

export default function NoteArticle({ note, noteNum, onOpenIndex }: Props) {
  const typeEn = TYPE_EN[note.type] || note.type

  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ fontSize: 11, color: 'rgba(244,244,241,.46)', display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", letterSpacing: '.1em' }}>
          {note.date} · {typeEn}
        </span>
        {note.private && (
          <span style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontWeight: 600, letterSpacing: '.01em' }}> · 비공개</span>
        )}
      </div>
      <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4.6vw,46px)', lineHeight: 1.12, letterSpacing: '-.025em', margin: '14px 0 6px', color: '#f6f6f3' }}>
        {note.title}
      </h2>
      <div style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 14, color: 'rgba(244,244,241,.52)', marginBottom: 26 }}>{note.sub}</div>
      {note.body.map((p, i) => (
        <p key={i} style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: 'rgba(244,244,241,.82)', margin: '0 0 18px', maxWidth: '64ch' }}>{p}</p>
      ))}
      <button
        onClick={onOpenIndex}
        className="hover-accent"
        style={{
          marginTop: 14,
          border: '1px solid rgba(255,255,255,.22)',
          color: '#f4f4f1',
          fontFamily: "'IBM Plex Mono',ui-monospace,monospace",
          fontSize: 11,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          padding: '8px 18px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: '.16s',
        }}
      >← Index</button>
    </article>
  )
}
