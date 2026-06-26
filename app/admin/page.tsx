'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Smile, ExternalLink, Plus } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Note, Work } from '@/types/database'
import { SEED_NOTES, SEED_WORKS } from '@/lib/data'
import NoteForm from '@/components/admin/NoteForm'
import WorkForm from '@/components/admin/WorkForm'

type Tab = 'notes' | 'works'

const BG   = '#FDFBF7'
const INK  = '#231F1A'
const mono = "'Geist',ui-monospace,monospace"
const suit = "'SUIT Variable',sans-serif"

const DEV_BYPASS =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab]           = useState<Tab>('notes')
  const [notes, setNotes]       = useState<Note[]>(DEV_BYPASS ? SEED_NOTES : [])
  const [works, setWorks]       = useState<Work[]>(DEV_BYPASS ? SEED_WORKS : [])
  const [editNote, setEditNote] = useState<Note | null | 'new'>(null)
  const [editWork, setEditWork] = useState<Work | null | 'new'>(null)
  const [userEmail, setUserEmail] = useState(DEV_BYPASS ? 'dev mode' : '')
  const [sortDir, setSortDir] = useState<'recent' | 'oldest'>('recent')
  const [sortOpen, setSortOpen] = useState(false)

  const fetchNotes = useCallback(async () => {
    if (DEV_BYPASS) return
    const { data } = await supabaseBrowser.from('notes').select('*').order('date', { ascending: false })
    if (data) setNotes(data)
  }, [])

  const fetchWorks = useCallback(async () => {
    if (DEV_BYPASS) return
    const { data } = await supabaseBrowser.from('works').select('*').order('year', { ascending: false }).order('created_at', { ascending: false })
    if (data) setWorks(data)
  }, [])

  useEffect(() => {
    if (!DEV_BYPASS) {
      supabaseBrowser.auth.getUser().then(({ data }) => {
        if (data.user) setUserEmail(data.user.email ?? '')
      })
    }
    fetchNotes()
    fetchWorks()
  }, [fetchNotes, fetchWorks])

  async function signOut() {
    await supabaseBrowser.auth.signOut()
    router.push('/admin/login')
  }

  async function saveNote(data: Omit<Note, 'id' | 'created_at'>) {
    const q = supabaseBrowser.from('notes') as any // eslint-disable-line @typescript-eslint/no-explicit-any
    if (editNote && editNote !== 'new') {
      await q.update(data).eq('id', editNote.id)
    } else {
      await q.insert(data)
    }
    await fetchNotes()
    setEditNote(null)
  }

  async function deleteNote(id: number) {
    if (!confirm('삭제할까요?')) return
    await supabaseBrowser.from('notes').delete().eq('id', id)
    await fetchNotes()
  }

  async function saveWork(data: Omit<Work, 'id' | 'created_at'>) {
    const q = supabaseBrowser.from('works') as any // eslint-disable-line @typescript-eslint/no-explicit-any
    if (editWork && editWork !== 'new') {
      await q.update(data).eq('id', editWork.id)
    } else {
      await q.insert(data)
    }
    await fetchWorks()
    setEditWork(null)
  }

  async function deleteWork(id: number) {
    if (!confirm('삭제할까요?')) return
    await supabaseBrowser.from('works').delete().eq('id', id)
    await fetchWorks()
  }

  const tabActive: React.CSSProperties = {
    fontFamily: mono, fontSize: 'var(--fs-btn)' as any,
    padding: '8px 14px', borderRadius: 13,
    border: '1px solid #FFD270',
    background: '#FFD270', color: INK,
    cursor: 'pointer', transition: '.15s',
  }
  const tabIdle: React.CSSProperties = {
    ...tabActive,
    background: 'transparent',
    border: `1px solid rgba(35,31,26,.2)`,
    color: `rgba(35,31,26,.55)`,
  }

  const colHead: React.CSSProperties = {
    fontFamily: mono, fontSize: 'var(--fs-label)' as any,
    color: 'rgba(35,31,26,.38)', textTransform: 'uppercase',
  }
  const editBtn: React.CSSProperties = {
    fontFamily: mono, fontSize: 'var(--fs-btn)' as any, padding: '7px 14px', borderRadius: 13,
    border: `1px solid rgba(35,31,26,.18)`, background: 'transparent',
    color: `rgba(35,31,26,.7)`, cursor: 'pointer', whiteSpace: 'nowrap',
  }
  const delBtn: React.CSSProperties = {
    ...editBtn,
    border: '1px solid rgba(192,57,43,.3)',
    color: '#c0392b',
  }
  const newBtn: React.CSSProperties = {
    background: '#FFD270', color: INK, border: 'none',
    borderRadius: 13, padding: '8px 14px', fontFamily: mono,
    fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer',
  }
  const countStyle: React.CSSProperties = {
    fontFamily: suit, fontSize: 'var(--fs-btn)' as any,
    color: 'rgba(35,31,26,.5)', whiteSpace: 'nowrap',
  }
  const sortSelect: React.CSSProperties = {
    fontFamily: suit, fontSize: 'var(--fs-btn)' as any, color: INK,
    background: 'rgba(35,31,26,.04)', border: '1px solid rgba(35,31,26,.18)',
    borderRadius: 13, padding: '7px 14px', cursor: 'pointer', outline: 'none',
  }

  const sortedNotes = [...notes].sort((a, b) =>
    sortDir === 'recent' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
  const sortedWorks = [...works].sort((a, b) =>
    sortDir === 'recent' ? b.year.localeCompare(a.year) : a.year.localeCompare(b.year))

  return (
    <div style={{ minHeight: '100svh', background: BG, color: INK, fontWeight: 400 }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid rgba(35,31,26,.1)`, padding: '14px clamp(16px,3vw,40px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <Smile size={20} strokeWidth={2} style={{ color: 'rgba(35,31,26,.4)', flexShrink: 0 }} />
          <span style={{ fontFamily: suit, fontSize: 'var(--fs-title)' as any, fontWeight: 600, color: 'rgba(35,31,26,.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userEmail}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <a href="/" target="_blank" rel="noopener" style={{ fontFamily: mono, fontSize: 'var(--fs-btn)' as any, padding: '7px 14px', borderRadius: 13, border: '1px solid rgba(35,31,26,.18)', background: 'transparent', color: 'rgba(35,31,26,.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>Site <ExternalLink size={16} strokeWidth={1.5} /></a>
          <button onClick={signOut} style={{ fontFamily: mono, fontSize: 'var(--fs-btn)' as any, padding: '7px 14px', borderRadius: 13, border: `1px solid rgba(35,31,26,.18)`, background: 'transparent', color: 'rgba(35,31,26,.55)', cursor: 'pointer' }}>Sign out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 'clamp(20px,4vw,48px) clamp(16px,3vw,24px)' }}>

        {/* Tabs + New button */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap', rowGap: 12 }}>
          <button style={tab === 'notes' ? tabActive : tabIdle} onClick={() => { setTab('notes'); setEditNote(null) }}>Notes</button>
          <button style={tab === 'works' ? tabActive : tabIdle} onClick={() => { setTab('works'); setEditWork(null) }}>Works</button>
          {((tab === 'notes' && !editNote) || (tab === 'works' && !editWork)) && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={countStyle}>총 {tab === 'notes' ? notes.length : works.length}개의 {tab === 'notes' ? '노트' : '작업'}</span>
              <div style={{ position: 'relative' }}>
                {sortOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setSortOpen(false)} />}
                <button type="button" onClick={() => setSortOpen(o => !o)}
                  style={{ ...sortSelect, display: 'flex', alignItems: 'center', gap: 24, paddingRight: 36, position: 'relative' }}>
                  {sortDir === 'recent' ? '최근등록순' : '오래된순'}
                  <ChevronDown size={16} strokeWidth={1.5} style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${sortOpen ? 180 : 0}deg)`, transition: 'transform .2s', color: 'rgba(35,31,26,.45)' }} />
                </button>
                {sortOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 100, background: '#fff', border: '1px solid rgba(35,31,26,.12)', borderRadius: 13, overflow: 'hidden', boxShadow: '0 4px 16px rgba(35,31,26,.1)', minWidth: '100%' }}>
                    {(['recent', 'oldest'] as const).map(val => (
                      <button key={val} type="button"
                        onClick={() => { setSortDir(val); setSortOpen(false) }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: suit, fontSize: 'var(--fs-btn)' as any, fontWeight: val === sortDir ? 600 : 400, color: val === sortDir ? INK : 'rgba(35,31,26,.55)', background: val === sortDir ? 'rgba(35,31,26,.04)' : 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {val === 'recent' ? '최근등록순' : '오래된순'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => tab === 'notes' ? setEditNote('new') : setEditWork('new')} style={{ ...newBtn, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} strokeWidth={1.5} /> New {tab === 'notes' ? 'Note' : 'Work'}
              </button>
            </div>
          )}
        </div>

        {/* ── NOTES ── */}
        {tab === 'notes' && (
          <>
            {editNote ? (
              <div style={{ background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 2px 12px rgba(35,31,26,.06)' }}>
                <div style={{ fontFamily: mono, fontSize: 'var(--fs-label)' as any, color: 'rgba(35,31,26,.4)', padding: '10px clamp(18px,3vw,28px)', borderBottom: '1px solid rgba(35,31,26,.1)' }}>
                  {editNote === 'new' ? 'NEW NOTE' : 'EDIT NOTE'}
                </div>
                <div style={{ padding: 'clamp(18px,3vw,28px)' as any }}>
                  <NoteForm
                    initial={editNote !== 'new' ? editNote : undefined}
                    onSave={saveNote}
                    onCancel={() => setEditNote(null)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 2px 12px rgba(35,31,26,.05)' }}>
                  <div className="adm-notes-head" style={colHead}>
                    <span>Date</span><span>Title</span><span>Type</span><span></span>
                  </div>
                  {sortedNotes.map(n => (
                    <div key={n.id} className="adm-notes-row">
                      <span className="adm-col-date" style={{ fontFamily: mono, fontSize: 'var(--fs-btn)' as any, color: `rgba(35,31,26,.45)`, opacity: n.private ? .5 : 1, textDecoration: n.private ? 'line-through' : undefined }}>{n.date}</span>
                      <span className="adm-col-title" style={{ fontFamily: suit, fontSize: 'var(--fs-title)' as any, fontWeight: 600, color: n.private ? `rgba(35,31,26,.4)` : INK }}>{n.title}</span>
                      <span className="adm-col-type" style={{ fontFamily: suit, fontSize: 'var(--fs-label)' as any }}>
                        <span style={{ display: 'inline-block', fontWeight: 600, color: 'rgba(35,31,26,.5)', border: '1px solid currentColor', borderRadius: 5, padding: '3px 9px', whiteSpace: 'nowrap' }}>{n.type}</span>
                      </span>
                      <div className="adm-col-actions" style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditNote(n)} style={editBtn}>Edit</button>
                        <button onClick={() => deleteNote(n.id)} style={delBtn}>Del</button>
                      </div>
                    </div>
                  ))}
                  {notes.length === 0 && (
                    <div style={{ padding: 32, fontFamily: suit, fontSize: 'var(--fs-title)' as any, color: `rgba(35,31,26,.3)`, textAlign: 'center' }}>노트가 없습니다</div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* ── WORKS ── */}
        {tab === 'works' && (
          <>
            {editWork ? (
              <div style={{ background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 2px 12px rgba(35,31,26,.06)' }}>
                <div style={{ fontFamily: mono, fontSize: 'var(--fs-label)' as any, color: 'rgba(35,31,26,.4)', padding: '10px clamp(18px,3vw,28px)', borderBottom: '1px solid rgba(35,31,26,.1)' }}>
                  {editWork === 'new' ? 'NEW WORK' : 'EDIT WORK'}
                </div>
                <div style={{ padding: 'clamp(18px,3vw,28px)' as any }}>
                  <WorkForm
                    initial={editWork !== 'new' ? editWork : undefined}
                    onSave={saveWork}
                    onCancel={() => setEditWork(null)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={{ background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 13, overflow: 'hidden', boxShadow: '0 2px 12px rgba(35,31,26,.05)' }}>
                  <div className="adm-works-head" style={colHead}>
                    <span>Thumb</span><span>Title</span><span>Role</span><span>Year</span><span></span>
                  </div>
                  {sortedWorks.map(w => (
                    <div key={w.id} className="adm-works-row">
                      <div className="adm-col-thumb"><img src={w.img} alt="" style={{ width: 56, height: 42, objectFit: 'cover', borderRadius: 13, border: `1px solid rgba(35,31,26,.1)` }} /></div>
                      <span className="adm-col-title" style={{ fontFamily: suit, fontSize: 'var(--fs-title)' as any, fontWeight: 600, color: INK }}>{w.title}</span>
                      <span className="adm-col-role" style={{ fontFamily: suit, fontSize: 'var(--fs-role)' as any, color: `rgba(35,31,26,.5)` }}>{w.role}</span>
                      <span className="adm-col-year" style={{ fontFamily: mono, fontSize: 'var(--fs-btn)' as any, color: `rgba(35,31,26,.45)` }}>{w.year}</span>
                      <div className="adm-col-actions" style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setEditWork(w)} style={editBtn}>Edit</button>
                        <button onClick={() => deleteWork(w.id)} style={delBtn}>Del</button>
                      </div>
                    </div>
                  ))}
                  {works.length === 0 && (
                    <div style={{ padding: 32, fontFamily: suit, fontSize: 'var(--fs-title)' as any, color: `rgba(35,31,26,.3)`, textAlign: 'center' }}>작업이 없습니다</div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
