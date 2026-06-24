'use client'

import type { Note, Work } from '@/types/database'
import WorkGrid from './WorkGrid'
import WorkDetail from './WorkDetail'
import NoteArticle from './NoteArticle'
import AboutSection from './AboutSection'
import ContactSection from './ContactSection'
import IndexSection from './IndexSection'

type View = 'work' | 'project' | 'note' | 'about' | 'contact' | 'index' | null

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log' }

interface Props {
  view: View
  noteIndex: number
  projIndex: number
  notes: Note[]
  works: Work[]
  onClose: () => void
  onOpenNote: (i: number) => void
  onOpenProject: (i: number) => void
  onBackToWork: () => void
  onOpenIndex: () => void
  onLightbox: (src: string) => void
}

function sheetTitle(view: View, notes: Note[], works: Work[], noteIndex: number, projIndex: number): string {
  if (view === 'note') {
    const note = notes[noteIndex]
    if (!note) return ''
    const num = String(notes.length - noteIndex).padStart(3, '0')
    return `${TYPE_EN[note.type] || note.type} N${num}`
  }
  if (view === 'project') return works[projIndex]?.title || ''
  const titles: Record<string, string> = { work: 'Selected Work — 04', about: 'About', contact: 'Contact', index: 'Index — Everything' }
  return view ? (titles[view] || '') : ''
}

export default function Sheet({ view, noteIndex, projIndex, notes, works, onClose, onOpenNote, onOpenProject, onBackToWork, onOpenIndex, onLightbox }: Props) {
  const open = view !== null
  const title = sheetTitle(view, notes, works, noteIndex, projIndex)

  return (
    <section style={{
      position: 'fixed',
      left: 0, right: 0, bottom: 0,
      top: 'clamp(38px,7vh,74px)',
      zIndex: 30,
      background: 'rgba(12,12,12,.9)',
      backdropFilter: 'blur(26px) saturate(1.1)',
      WebkitBackdropFilter: 'blur(26px) saturate(1.1)',
      borderTop: '1px solid rgba(255,255,255,.14)',
      borderRadius: '18px 18px 0 0',
      boxShadow: '0 -34px 100px -20px rgba(0,0,0,.85)',
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'translateY(0%)' : 'translateY(101%)',
      pointerEvents: open ? 'auto' : 'none',
      transition: 'transform .55s cubic-bezier(.16,1,.3,1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px clamp(16px,3vw,34px)', borderBottom: '1px solid rgba(255,255,255,.1)', flex: 'none' }}>
        <span style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontSize: 12, fontWeight: 600, letterSpacing: '.02em', color: 'rgba(244,244,241,.62)' }}>{title}</span>
        <button
          onClick={onClose}
          className="hover-accent"
          style={{ border: '1px solid rgba(255,255,255,.24)', color: '#f4f4f1', fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 11, letterSpacing: '.06em', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', transition: '.16s' }}
        >Close</button>
      </div>

      <div style={{ padding: 'clamp(18px,3vw,38px)', overflowY: 'auto', color: '#f4f4f1', flex: 1 }}>
        {view === 'work' && <WorkGrid works={works} onOpen={onOpenProject} />}
        {view === 'project' && works[projIndex] && (
          <WorkDetail work={works[projIndex]} onBack={onBackToWork} onLightbox={onLightbox} />
        )}
        {view === 'note' && notes[noteIndex] && (
          <NoteArticle
            note={notes[noteIndex]}
            noteNum={String(notes.length - noteIndex).padStart(3, '0')}
            onOpenIndex={onOpenIndex}
          />
        )}
        {view === 'about' && <AboutSection />}
        {view === 'contact' && <ContactSection />}
        {view === 'index' && <IndexSection notes={notes} onOpenNote={onOpenNote} />}
      </div>
    </section>
  )
}
