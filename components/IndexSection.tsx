'use client'

import { useState } from 'react'
import type { Note } from '@/types/database'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '로그': 'Log', '습작': 'Study', '회고': 'Retro', '일상': 'Daily' }
const TYPE_ORDER = ['노트', '로그', '습작', '회고', '일상']

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
    padding: '8px 15px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,.24)',
    background: 'transparent',
    color: '#f4f4f1',
    cursor: 'pointer',
    transition: '.18s',
    whiteSpace: 'nowrap',
  }
  const tabActive: React.CSSProperties = {
    ...tabBase,
    background: 'var(--accent,#ffd270)',
    color: 'var(--accent-fg,#0e0e0e)',
    border: '1px solid var(--accent,#ffd270)',
  }

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={t === filter ? tabActive : tabBase}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'rgba(244,244,241,.4)', padding: '0 14px 10px', borderBottom: '1px solid rgba(255,255,255,.18)' }}>
        <span>DATE / TITLE</span><span>TYPE</span>
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
            borderBottom: '1px solid rgba(255,255,255,.09)',
            padding: '14px 14px',
            cursor: 'pointer',
            color: '#f4f4f1',
            display: 'grid',
            gridTemplateColumns: '96px 1fr auto',
            gap: 14,
            alignItems: 'center',
            transition: 'background .15s,color .15s',
            background: 'transparent',
          }}
        >
          <span style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: 'currentColor', opacity: .55 }}>{note.date}</span>
          <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, fontWeight: 600, color: 'currentColor', opacity: .92, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</span>
          <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 600, color: 'currentColor', opacity: .7, border: '1px solid currentColor', borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }}>
            {TYPE_EN[note.type] || note.type}
          </span>
        </button>
      ))}
    </div>
  )
}
