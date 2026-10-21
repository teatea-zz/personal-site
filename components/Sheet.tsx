'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import type { Note, Work } from '@/types/database'
import { T } from '@/lib/theme'
import { saveNote, saveWork, deleteNote, deleteWork, type NoteInput, type WorkInput } from '@/lib/admin-actions'
import NoteForm from './admin/NoteForm'
import WorkForm from './admin/WorkForm'
import WorkGrid from './WorkGrid'
import WorkDetail from './WorkDetail'
import NoteArticle from './NoteArticle'
import AboutSection from './AboutSection'
import ContactSection from './ContactSection'
import IndexSection from './IndexSection'

type View = 'work' | 'project' | 'note' | 'about' | 'contact' | 'index' | null

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log', '회고': 'Retro', '일상': 'Daily' }

interface Props {
  view: View
  noteIndex: number
  projIndex: number
  notes: Note[]
  works: Work[]
  isAdmin: boolean
  onRefresh: () => Promise<{ notes: Note[]; works: Work[] }>
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
    return `${TYPE_EN[note.type] || note.type} N.${num}`
  }
  if (view === 'project') return works[projIndex]?.title || ''
  const titles: Record<string, string> = { work: 'WORK', about: 'ABOUT', contact: 'CONTACT', index: 'INDEX' }
  return view ? (titles[view] || '') : ''
}

// 어드민 편집 상태 — 로그인한 관리자만 진입 가능
type Editing =
  | { kind: 'work'; target: Work | 'new' }
  | { kind: 'note'; target: Note | 'new' }
  | null

const headerBtn: React.CSSProperties = {
  border: `1px solid ${T.btnBorder}`, color: T.text, fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12,
  padding: '8px 18px', borderRadius: 8, cursor: 'pointer', transition: 'background-color .16s ease-out, color .16s ease-out',
  display: 'flex', alignItems: 'center', gap: 4,
}

export default function Sheet({ view, noteIndex, projIndex, notes, works, isAdmin, onRefresh, onClose, onOpenNote, onOpenProject, onBackToWork, onOpenIndex, onLightbox }: Props) {
  const open = view !== null
  const [editing, setEditing] = useState<Editing>(null)

  // 다른 화면으로 이동하거나 시트를 닫거나 로그아웃하면 편집 종료
  useEffect(() => { setEditing(null) }, [view, noteIndex, projIndex, isAdmin])

  const editTitle = editing
    ? `${editing.target === 'new' ? 'NEW' : 'EDIT'} ${editing.kind === 'work' ? 'WORK' : 'NOTE'}`
    : ''
  const title = editTitle || sheetTitle(view, notes, works, noteIndex, projIndex)

  // 헤더 Close 좌측 관리자 버튼 — 목록: + New / 상세: Edit
  let adminAction: { label: string; plus?: boolean; onClick: () => void } | null = null
  if (isAdmin && !editing) {
    if (view === 'work') adminAction = { label: 'New Work', plus: true, onClick: () => setEditing({ kind: 'work', target: 'new' }) }
    if (view === 'index') adminAction = { label: 'New Note', plus: true, onClick: () => setEditing({ kind: 'note', target: 'new' }) }
    if (view === 'project' && works[projIndex]) adminAction = { label: 'Edit', onClick: () => setEditing({ kind: 'work', target: works[projIndex] }) }
    if (view === 'note' && notes[noteIndex]) adminAction = { label: 'Edit', onClick: () => setEditing({ kind: 'note', target: notes[noteIndex] }) }
  }

  // 저장 후: 새 글은 목록으로, 수정한 글은 (정렬이 바뀌었을 수 있어) id로 위치를 다시 찾아 상세 유지
  async function handleSaveWork(data: WorkInput) {
    if (editing?.kind !== 'work') return
    const target = editing.target
    try { await saveWork(data, target === 'new' ? undefined : target.id) }
    catch (e) { alert(`저장에 실패했어요.\n${(e as Error).message}`); return }
    const next = await onRefresh()
    setEditing(null)
    if (target !== 'new') {
      const i = next.works.findIndex(w => w.id === target.id)
      if (i >= 0) onOpenProject(i)
    }
  }
  async function handleSaveNote(data: NoteInput) {
    if (editing?.kind !== 'note') return
    const target = editing.target
    try { await saveNote(data, target === 'new' ? undefined : target.id) }
    catch (e) { alert(`저장에 실패했어요.\n${(e as Error).message}`); return }
    const next = await onRefresh()
    setEditing(null)
    if (target !== 'new') {
      const i = next.notes.findIndex(n => n.id === target.id)
      if (i >= 0) onOpenNote(i)
    }
  }
  // 삭제 후: 해당 목록(WORK / INDEX)으로 돌아감
  async function handleDeleteWork() {
    if (editing?.kind !== 'work' || editing.target === 'new') return
    if (!confirm('이 작업물을 삭제할까요?')) return
    await deleteWork(editing.target)
    await onRefresh()
    onBackToWork()
  }
  async function handleDeleteNote() {
    if (editing?.kind !== 'note' || editing.target === 'new') return
    if (!confirm('이 노트를 삭제할까요?')) return
    await deleteNote(editing.target)
    await onRefresh()
    onOpenIndex()
  }

  return (
    <>
    {/* 딤 배경 — 시트가 열리면 뒤 화면을 어둡게, 클릭 시 닫기 */}
    <div
      aria-hidden="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 29,
        background: 'rgba(35,31,26,.6)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity .3s ease',
      }}
    />
    <section style={{
      position: 'fixed',
      left: 0, right: 0, bottom: 0,
      top: 'clamp(38px,7vh,74px)',
      zIndex: 30,
      background: T.sheetBg,
      backdropFilter: 'blur(26px) saturate(1.1)',
      WebkitBackdropFilter: 'blur(26px) saturate(1.1)',
      borderTop: `1px solid ${T.sheetBorder}`,
      borderRadius: '18px 18px 0 0',
      boxShadow: open ? T.sheetShadow : 'none',
      display: 'flex',
      flexDirection: 'column',
      transform: open ? 'translateY(0%)' : 'translateY(101%)',
      pointerEvents: open ? 'auto' : 'none',
      transition: 'transform .48s cubic-bezier(.16,1,.3,1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px clamp(16px,3vw,34px)', borderBottom: `1px solid ${T.hairline}`, flex: 'none' }}>
        <span style={{ fontFamily: view === 'project' && !editing ? "'SUIT Variable',sans-serif" : "'Geist',ui-monospace,monospace", fontSize: 14, fontWeight: 400, color: T.textDim }}>{title}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* 목록으로 돌아가기 — 편집 중 / 작업물 상세 / 노트 상세 (시트는 유지) */}
          {(editing || view === 'project' || view === 'note') && (
            <button
              onClick={() => { const toIndex = editing ? editing.kind === 'note' : view === 'note'; setEditing(null); if (toIndex) onOpenIndex(); else onBackToWork() }}
              className="hover-accent"
              style={headerBtn}
            >
              <ArrowLeft size={14} strokeWidth={1.5} />{(editing ? editing.kind === 'note' : view === 'note') ? 'INDEX' : 'WORK'}
            </button>
          )}
          {adminAction && (
            <button onClick={adminAction.onClick} className="hover-accent" style={headerBtn}>
              {adminAction.plus && <Plus size={14} strokeWidth={1.5} />}{adminAction.label}
            </button>
          )}
          <button onClick={onClose} className="hover-accent" style={headerBtn}>Close</button>
        </div>
      </div>

      {/* 작업물 상세(data-split)는 데스크톱에서 시트 스크롤 대신 좌우 열이 각자 스크롤 */}
      <div
        className="sheet-body"
        data-split={!editing && (view === 'project' || (view === 'note' && (notes[noteIndex]?.layout ?? 'text') !== 'text')) ? '' : undefined}
        style={{ padding: 'clamp(18px,3vw,38px) clamp(16px,3vw,34px)', overflowY: 'auto', color: T.text, flex: 1, minHeight: 0 }}
      >
        {/* 편집 중이면 콘텐츠 대신 어드민 폼 */}
        {editing && (
          <div style={{ maxWidth: 920, margin: '0 auto' }}>
            {editing.kind === 'work' ? (
              <WorkForm
                key={editing.target === 'new' ? 'new' : editing.target.id}
                initial={editing.target === 'new' ? undefined : editing.target}
                onSave={handleSaveWork}
                onCancel={() => setEditing(null)}
                onDelete={handleDeleteWork}
              />
            ) : (
              <NoteForm
                key={editing.target === 'new' ? 'new' : editing.target.id}
                initial={editing.target === 'new' ? undefined : editing.target}
                onSave={handleSaveNote}
                onCancel={() => setEditing(null)}
                onDelete={handleDeleteNote}
              />
            )}
          </div>
        )}
        {!editing && <>
        {view === 'work' && <WorkGrid works={works} onOpen={onOpenProject} />}
        {view === 'project' && works[projIndex] && (
          <WorkDetail work={works[projIndex]} onLightbox={onLightbox} />
        )}
        {view === 'note' && notes[noteIndex] && (
          <NoteArticle
            note={notes[noteIndex]}
            noteNum={String(notes.length - noteIndex).padStart(3, '0')}
            onLightbox={onLightbox}
          />
        )}
        {view === 'about' && <AboutSection />}
        {view === 'contact' && <ContactSection />}
        {view === 'index' && <IndexSection notes={notes} onOpenNote={onOpenNote} />}
        </>}
      </div>
    </section>
    </>
  )
}
