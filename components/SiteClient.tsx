'use client'

import { useState } from 'react'
import type { Note, Work } from '@/types/database'
import HomeCard from './HomeCard'
import Sheet from './Sheet'
import Lightbox from './Lightbox'
import SocialBar from './SocialBar'

type View = 'work' | 'project' | 'note' | 'about' | 'contact' | 'index' | null

const IMG_FILTER = 'grayscale(.15) sepia(.18) saturate(.82) contrast(1.05) brightness(.9)'

interface Props {
  notes: Note[]
  works: Work[]
}

export default function SiteClient({ notes, works }: Props) {
  const [view, setView] = useState<View>(null)
  const [noteIndex, setNoteIndex] = useState(0)
  const [projIndex, setProjIndex] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const openNote = (i: number) => { setNoteIndex(i); setView('note') }
  const openView = (v: string) => setView(v as View)
  const openProject = (i: number) => { setProjIndex(i); setView('project') }

  return (
    <div style={{ position: 'relative', minHeight: '100svh' }}>
      {/* Hero section */}
      <section style={{
        position: 'relative',
        minHeight: '100svh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 'clamp(16px,3vw,40px)',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: "url('https://picsum.photos/seed/jiwoo-field-mist-7/1900/1200')",
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: IMG_FILTER, zIndex: 0,
        }} />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,8,8,.62) 0%, rgba(8,8,8,.12) 38%, rgba(8,8,8,.66) 100%)', zIndex: 1 }} />
        {/* Grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .15,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }} />

        <HomeCard
          recentNotes={notes.slice(0, 4)}
          onOpenNote={openNote}
          onOpenView={openView}
        />

        <SocialBar />
      </section>

      {/* Sheet panel */}
      <Sheet
        view={view}
        noteIndex={noteIndex}
        projIndex={projIndex}
        notes={notes}
        works={works}
        onClose={() => setView(null)}
        onOpenNote={openNote}
        onOpenProject={openProject}
        onBackToWork={() => setView('work')}
        onOpenIndex={() => setView('index')}
        onLightbox={setLightbox}
      />

      {/* Lightbox */}
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  )
}
