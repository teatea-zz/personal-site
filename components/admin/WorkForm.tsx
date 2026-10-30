'use client'

import { useState, useRef } from 'react'
import { CircleX, Square, CheckSquare } from 'lucide-react'
import type { Work } from '@/types/database'
import {
  type ImgItem, toItems, pickFiles, revoke, removeFromStorage, uploadPending,
  useDraft, DraftBanner, useLeaveGuard, Segmented, SortableThumbs, LEAVE_MESSAGE,
} from './form-shared'

const INK  = '#231F1A'
const mono = "'Geist',ui-monospace,monospace"
const suit = "'SUIT Variable',sans-serif"

// 글로 된 입력값 (임시 저장 대상 — 이미지는 원본이 있으니 제외)
type FormData = {
  title:       string
  year:        string
  role:        string
  field:       string
  tools:       string
  tag:         string
  img:         string // 히어로 URL 직접 입력값 (파일을 고르면 heroFile이 우선)
  desc:        string
  galleryCols: number
  private:     boolean
}

function workToForm(work?: Partial<Work>): FormData {
  return {
    title:   work?.title   ?? '',
    year:    work?.year    ?? '',
    role:    work?.role    ?? '',
    field:   work?.field   ?? '',
    tools:   work?.tools   ?? '',
    tag:     work?.tag     ?? '',
    img:     work?.img     ?? '',
    desc:    (work?.description ?? []).map((b: any) => {
      if (typeof b === 'string') {
        try { const p = JSON.parse(b); return p.type === 'text' ? p.content : null } catch { return b }
      }
      return b.type === 'text' ? b.content : null
    }).filter(Boolean).join('\n\n'),
    galleryCols: work?.gallery_cols ?? 1,
    private:     work?.private ?? false,
  }
}

interface Props {
  initial?: Work
  /** 실패 시 throw — 폼이 알림을 띄우고 내용을 그대로 유지 */
  onSave: (data: Omit<Work, 'id' | 'created_at'>) => Promise<void>
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
  borderRadius: 'var(--radius-12)',
  padding: 'var(--space-12) var(--space-16)',
  color: INK,
  fontFamily: suit,
  fontSize: 'var(--fs-input)' as any,
  fontWeight: 400,
  outline: 'none',
  marginBottom: 'var(--space-16)',
}
const lbl: React.CSSProperties = {
  fontFamily: suit,
  fontSize: 'var(--fs-label)' as any,
  fontWeight: 400,
  color: 'rgba(35,31,26,.45)',
  display: 'block',
  marginBottom: 'var(--space-4)',
}
const uploadBtn: React.CSSProperties = {
  flexShrink: 0,
  background: 'rgba(35,31,26,.06)',
  border: '1px solid rgba(35,31,26,.18)',
  borderRadius: 'var(--radius-12)',
  padding: 'var(--space-12) var(--space-16)',
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
  borderRadius: 'var(--radius-12)',
  padding: 'var(--space-12) var(--space-24)',
  fontFamily: mono,
  fontSize: 'var(--fs-btn)' as any,
  cursor: 'pointer',
}

export default function WorkForm({ initial, onSave, onCancel, onDelete, onDirtyChange }: Props) {
  const initialForm = useRef(workToForm(initial)).current
  const [form, setForm]         = useState<FormData>(initialForm)
  const [heroFile, setHeroFile] = useState<ImgItem | null>(null)          // 아직 안 올린 히어로
  const [gallery, setGallery]   = useState<ImgItem[]>(toItems(initial?.gallery ?? []))
  const [saving, setSaving]     = useState<string | null>(null)           // 버튼 진행 문구
  const heroRef    = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const draft = useDraft(`draft:work:${initial?.id ?? 'new'}`, form, initialForm)
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm) || !!heroFile
    || gallery.map(g => g.url).join('\n') !== (initial?.gallery ?? []).join('\n')
  useLeaveGuard(dirty, onDirtyChange)

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const heroPreview = heroFile?.url ?? form.img

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving('Saving…')
    let uploaded: string[] = []
    try {
      // 1. 이미지 업로드 (실패하면 이번에 올린 파일은 정리되고 여기서 중단)
      const res = await uploadPending('works', [heroFile ? [heroFile] : [], gallery],
        (done, total) => setSaving(`이미지 업로드 ${done + 1}/${total}`))
      uploaded = res.uploaded
      const img = heroFile ? res.urls[0][0] : form.img
      const galleryUrls = res.urls[1]

      // 2. 글 저장
      setSaving('Saving…')
      await onSave({
        title:       form.title,
        year:        form.year,
        role:        form.role,
        field:       form.field,
        tools:       form.tools,
        tag:         form.tag,
        img,
        description: form.desc.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(content => ({ type: 'text' as const, content })),
        gallery:     galleryUrls,
        gallery_cols: form.galleryCols,
        private:     form.private,
      })

      // 3. 저장 성공 후에만: 빠진 기존 이미지 삭제 · 임시 저장 삭제
      const kept = new Set([img, ...galleryUrls])
      const removed = [initial?.img ?? '', ...(initial?.gallery ?? [])].filter(u => u && !kept.has(u))
      await removeFromStorage('works', removed).catch(() => {})
      draft.clear()
      revoke([...(heroFile ? [heroFile] : []), ...gallery])
    } catch (err) {
      // 글 저장이 실패했으면 방금 올린 이미지도 정리 → 다시 누르면 처음부터 깨끗하게
      await removeFromStorage('works', uploaded).catch(() => {})
      alert(`저장에 실패했어요. 입력한 내용은 그대로 있어요.\n${(err as Error)?.message ?? ''}`)
      setSaving(null)
    }
  }

  function handleCancel() {
    if (dirty && !confirm(LEAVE_MESSAGE)) return
    revoke([...(heroFile ? [heroFile] : []), ...gallery])
    onCancel()
  }

  return (
    <form onSubmit={handleSubmit}>
      {draft.pending && (
        <DraftBanner onRestore={() => draft.restore(setForm)} onDiscard={draft.discard} />
      )}

      {/* Row 1: Title / Year / Gallery 단 수 */}
      <div className="adm-form-grid3">
        <div><label style={lbl}>Title</label><input style={{ ...inp, marginBottom: 0 }} value={form.title} onChange={set('title')} required /></div>
        <div><label style={lbl}>Year</label><input style={{ ...inp, marginBottom: 0 }} value={form.year} onChange={set('year')} placeholder="2026" required /></div>
        {/* 상세 페이지 갤러리 단 수 (모바일은 3단도 2단으로 표시) */}
        <div>
          <label style={lbl}>Gallery</label>
          <Segmented label="갤러리 단 수" value={form.galleryCols} onChange={n => setForm(f => ({ ...f, galleryCols: n }))}
            options={[1, 2, 3].map(n => ({ value: n, label: `${n}단` }))} />
        </div>
      </div>

      {/* Row 2: Role / Field / Tools / Tag */}
      <div className="adm-form-grid4" style={{ marginTop: 'var(--space-16)' }}>
        <div><label style={lbl}>Role</label><input style={{ ...inp, marginBottom: 0 }} value={form.role} onChange={set('role')} required /></div>
        <div><label style={lbl}>Field</label><input style={{ ...inp, marginBottom: 0 }} value={form.field} onChange={set('field')} required /></div>
        <div><label style={lbl}>Tools</label><input style={{ ...inp, marginBottom: 0 }} value={form.tools} onChange={set('tools')} placeholder="Figma, React" required /></div>
        <div><label style={lbl}>Tag</label><input style={{ ...inp, marginBottom: 0 }} value={form.tag} onChange={set('tag')} placeholder="WEB (선택)" /></div>
      </div>

      {/* Hero image */}
      <div style={{ marginTop: 'var(--space-16)' }}>
        <label style={lbl}>Hero Image</label>
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center', marginBottom: heroPreview ? 'var(--space-12)' : 'var(--space-16)' }}>
          <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={heroFile ? heroFile.file!.name : form.img} disabled={!!heroFile}
            onChange={set('img')} placeholder="URL 직접 입력 또는 파일 선택 (저장할 때 업로드)" />
          <button type="button" onClick={() => heroRef.current?.click()} style={uploadBtn}>↑ Upload</button>
          <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const [item] = pickFiles(e.target.files); if (item) { if (heroFile) revoke([heroFile]); setHeroFile(item) } e.target.value = '' }} />
        </div>
        {heroPreview && (
          <div style={{ position: 'relative', aspectRatio: '16/7', overflow: 'hidden', borderRadius: 'var(--radius-12)', background: 'rgba(35,31,26,.06)', marginBottom: 'var(--space-16)' }}>
            <img src={heroPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {/* 화면에서만 빼고, 실제 파일 삭제는 저장 성공 후 */}
            <button type="button"
              onClick={() => { if (heroFile) { revoke([heroFile]); setHeroFile(null) } else setForm(f => ({ ...f, img: '' })) }}
              style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <CircleX size={32} strokeWidth={1} fill="#F33838" color="#fff" />
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      <label style={lbl}>Description (단락 사이 빈 줄)</label>
      <textarea style={{ ...inp, height: 480, resize: 'none', overflowY: 'auto', lineHeight: 1.7 }} value={form.desc} onChange={set('desc')} />

      {/* Gallery */}
      <label style={lbl}>Gallery Images (끌어서 순서 변경)</label>
      <SortableThumbs items={gallery} setItems={setGallery} onPick={() => galleryRef.current?.click()} />
      <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={e => { const items = pickFiles(e.target.files); setGallery(g => [...g, ...items]); e.target.value = '' }} />

      {/* 하단: 비공개 (노트와 같은 위치) · 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)', marginTop: 'var(--space-16)' }}>
        <label style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 'var(--space-8)', cursor: 'pointer' }}
          onClick={() => setForm(f => ({ ...f, private: !f.private }))}>
          {form.private
            ? <CheckSquare size={20} strokeWidth={1.5} color={INK} />
            : <Square size={20} strokeWidth={1.5} color="rgba(35,31,26,.35)" />}
          비공개
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 'var(--space-12)' }}>
          {initial && onDelete && (
            <button type="button" onClick={onDelete} disabled={!!saving} style={deleteBtn}>Delete</button>
          )}
          <button type="submit" disabled={!!saving}
            style={{ background: 'var(--accent)', color: INK, border: 'none', borderRadius: 'var(--radius-12)', padding: 'var(--space-12) var(--space-24)', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer' }}>
            {saving ?? (initial ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={handleCancel} disabled={!!saving}
            style={{ background: 'transparent', color: 'rgba(35,31,26,.5)', border: '1px solid rgba(35,31,26,.2)', borderRadius: 'var(--radius-12)', padding: 'var(--space-12) var(--space-24)', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
