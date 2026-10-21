'use client'

import { useState, useRef } from 'react'
import { Square, CheckSquare, ChevronDown, CircleX } from 'lucide-react'
import type { Note, NoteLayout, TextBlock, ImageBlock } from '@/types/database'
import {
  type ImgItem, toItems, pickFiles, revoke, removeFromStorage, uploadPending,
  useDraft, DraftBanner, useLeaveGuard, Segmented, SortableThumbs, LEAVE_MESSAGE,
} from './form-shared'

const TYPES = ['노트', '로그', '습작', '회고', '일상']
const LAYOUTS: { value: NoteLayout; label: string }[] = [
  { value: 'text',    label: '글' },
  { value: 'image-1', label: '사진 1단' },
  { value: 'image-2', label: '사진 2단' },
  { value: 'image-3', label: '사진 3단' },
]
// 타입별 기본 레이아웃 — 습작 · 일상은 사진 2단, 나머지는 글
const defaultLayout = (type: string): NoteLayout => (type === '습작' || type === '일상' ? 'image-2' : 'text')
const INK   = '#231F1A'
const mono  = "'Geist',ui-monospace,monospace"
const suit  = "'SUIT Variable',sans-serif"

type FormData = {
  type: string
  date: string
  title: string
  sub: string
  body: string
  private: boolean
  layout: NoteLayout
}

function today(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`
}

function noteToForm(note?: Partial<Note>): FormData {
  return {
    type:    note?.type    ?? '노트',
    date:    note?.date    ?? today(),
    title:   note?.title   ?? '',
    sub:     note?.sub     ?? '',
    body:    (note?.body ?? []).map((b: any) => {
      if (typeof b === 'string') {
        try { const p = JSON.parse(b); return p.type === 'text' ? p.content : null } catch { return b }
      }
      return b.type === 'text' ? b.content : null
    }).filter(Boolean).join('\n\n'),
    private: note?.private ?? false,
    layout:  note?.layout  ?? defaultLayout(note?.type ?? '노트'),
  }
}

interface Props {
  initial?: Note
  /** 실패 시 throw — 폼이 알림을 띄우고 내용을 그대로 유지 */
  onSave: (data: Omit<Note, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
  /** 넘기면 편집 모드에서 Update 좌측에 Delete 버튼 노출 (메인 사이트 시트용) */
  onDelete?: () => Promise<void>
  /** 저장 안 한 변경 여부 — 시트 Close · 목록 버튼에서 나가기 전 확인용 */
  onDirtyChange?: (dirty: boolean) => void
}

const inp: React.CSSProperties = {
  width: '100%',
  background: '#FFFFFF',
  border: '1px solid rgba(35,31,26,.15)',
  borderRadius: 13,
  padding: '10px 14px',
  color: INK,
  fontFamily: suit,
  fontSize: 'var(--fs-input)' as any,
  fontWeight: 400,
  outline: 'none',
  marginBottom: 14,
}
const lbl: React.CSSProperties = {
  fontFamily: suit,
  fontSize: 'var(--fs-label)' as any,
  fontWeight: 400,
  color: 'rgba(35,31,26,.45)',
  display: 'block',
  marginBottom: 5,
}
const uploadBtn: React.CSSProperties = {
  flexShrink: 0,
  background: 'rgba(35,31,26,.06)',
  border: '1px solid rgba(35,31,26,.18)',
  borderRadius: 13,
  padding: '10px 16px',
  color: INK,
  fontFamily: mono,
  fontSize: 'var(--fs-btn)' as any,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const deleteBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#c0392b',
  border: '1px solid rgba(192,57,43,.3)',
  borderRadius: 13,
  padding: '10px 22px',
  fontFamily: mono,
  fontSize: 'var(--fs-btn)' as any,
  cursor: 'pointer',
}

export default function NoteForm({ initial, onSave, onCancel, onDelete, onDirtyChange }: Props) {
  const initialForm = useRef(noteToForm(initial)).current
  const [form, setForm]   = useState<FormData>(initialForm)
  const [typeOpen, setTypeOpen] = useState(false)
  const [images, setImages] = useState<ImgItem[]>(toItems(initial?.images ?? []))
  const [saving, setSaving] = useState<string | null>(null) // 버튼 진행 문구
  const imagesRef = useRef<HTMLInputElement>(null)

  const draft = useDraft(`draft:note:${initial?.id ?? 'new'}`, form, initialForm)
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm)
    || images.map(i => i.url).join('\n') !== (initial?.images ?? []).join('\n')
  useLeaveGuard(dirty, onDirtyChange)

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving('Saving…')
    let uploaded: string[] = []
    try {
      // 1. 이미지 업로드 (실패하면 이번에 올린 파일은 정리되고 여기서 중단)
      const res = await uploadPending('notes', [images], (done, total) => setSaving(`이미지 업로드 ${done + 1}/${total}`))
      uploaded = res.uploaded
      const imageUrls = res.urls[0]

      // 2. 글 저장
      setSaving('Saving…')
      await onSave({
        type:    form.type,
        date:    form.date,
        title:   form.title,
        sub:     form.sub,
        body:    form.body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(content => ({ type: 'text' as const, content })),
        images:  imageUrls,
        private: form.private,
        layout:  form.layout,
      })

      // 3. 저장 성공 후에만: 빠진 기존 이미지 삭제 · 임시 저장 삭제
      const kept = new Set(imageUrls)
      await removeFromStorage('notes', (initial?.images ?? []).filter(u => !kept.has(u))).catch(() => {})
      draft.clear()
      revoke(images)
    } catch (err) {
      // 글 저장이 실패했으면 방금 올린 이미지도 정리 → 다시 누르면 처음부터 깨끗하게
      await removeFromStorage('notes', uploaded).catch(() => {})
      alert(`저장에 실패했어요. 입력한 내용은 그대로 있어요.\n${(err as Error)?.message ?? ''}`)
      setSaving(null)
    }
  }

  function handleCancel() {
    if (dirty && !confirm(LEAVE_MESSAGE)) return
    revoke(images)
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      {draft.pending && (
        <DraftBanner onRestore={() => draft.restore(setForm)} onDiscard={draft.discard} />
      )}
      <div className="adm-form-grid3eq">
        <div>
          <label style={lbl}>Type</label>
          <div style={{ position: 'relative' }}>
            {typeOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setTypeOpen(false)} />}
            <button type="button" onClick={() => setTypeOpen(o => !o)}
              style={{ ...inp, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 36, position: 'relative', cursor: 'pointer', textAlign: 'left' }}>
              {form.type}
              <ChevronDown size={16} strokeWidth={1.5} style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${typeOpen ? 180 : 0}deg)`, transition: 'transform .2s ease-out', pointerEvents: 'none', color: 'rgba(35,31,26,.45)' }} />
            </button>
            {typeOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100, background: '#fff', border: '1px solid rgba(35,31,26,.12)', borderRadius: 13, overflow: 'hidden', boxShadow: '0 4px 16px rgba(35,31,26,.1)', minWidth: '100%', transformOrigin: 'top left', animation: 'dropdown-in .18s cubic-bezier(.23,1,.32,1) forwards' }}>
                {TYPES.map(t => (
                  <button key={t} type="button"
                    onClick={() => { setForm(f => ({ ...f, type: t, layout: defaultLayout(t), ...(t === '일상' && !f.private ? { private: true } : {}) })); setTypeOpen(false) }}
                    style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontFamily: suit, fontSize: 'var(--fs-input)' as any, fontWeight: t === form.type ? 600 : 400, color: t === form.type ? INK : 'rgba(35,31,26,.55)', background: t === form.type ? 'rgba(35,31,26,.04)' : 'transparent', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label style={lbl}>Date</label>
          <input style={{ ...inp, marginBottom: 0 }} value={form.date} onChange={set('date')} placeholder="2026.06.12" required />
        </div>
        {/* 상세 레이아웃 — 타입을 고르면 기본값으로 바뀌고, 직접 바꿀 수도 있음 */}
        <div>
          <label style={lbl}>Layout</label>
          <Segmented label="상세 레이아웃" value={form.layout} options={LAYOUTS} onChange={l => setForm(f => ({ ...f, layout: l }))} />
        </div>
      </div>

      {/* Title(2칸) + Subtitle(1칸) — 윗줄과 같은 3칸 그리드라 Subtitle 폭 = Layout 폭 */}
      <div className="adm-form-grid3eq" style={{ marginTop: 14, marginBottom: 14 }}>
        <div className="adm-span2">
          <label style={lbl}>Title</label>
          <input style={{ ...inp, marginBottom: 0 }} value={form.title} onChange={set('title')} required />
        </div>
        <div>
          <label style={lbl}>Subtitle</label>
          <input style={{ ...inp, marginBottom: 0 }} value={form.sub} onChange={set('sub')} />
        </div>
      </div>

      <label style={lbl}>Body (단락 사이 빈 줄로 구분)</label>
      <textarea style={{ ...inp, height: 480, resize: 'none', overflowY: 'auto', lineHeight: 1.7 }} value={form.body} onChange={set('body')} />

      {/* Images */}
      <label style={lbl}>Images (선택 · 끌어서 순서 변경)</label>
      <SortableThumbs items={images} setItems={setImages} onPick={() => imagesRef.current?.click()} />
      <input ref={imagesRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { const items = pickFiles(e.target.files); setImages(list => [...list, ...items]); e.target.value = '' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <label style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => setForm(f => ({ ...f, private: !f.private }))}>
          {form.private
            ? <CheckSquare size={20} strokeWidth={1.5} color={INK} />
            : <Square size={20} strokeWidth={1.5} color="rgba(35,31,26,.35)" />}
          비공개
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          {initial && onDelete && (
            <button type="button" onClick={onDelete} disabled={!!saving} style={deleteBtn}>Delete</button>
          )}
          <button type="submit" disabled={!!saving}
            style={{ background: 'var(--accent)', color: INK, border: 'none', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer' }}>
            {saving ?? (initial ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={handleCancel} disabled={!!saving}
            style={{ background: 'transparent', color: `rgba(35,31,26,.5)`, border: '1px solid rgba(35,31,26,.2)', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
