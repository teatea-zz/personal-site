'use client'

import { useState, useRef } from 'react'
import { Square, CheckSquare, ChevronDown, CircleX } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Note, TextBlock, ImageBlock } from '@/types/database'

const TYPES = ['노트', '로그', '습작', '회고', '일상']
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
  }
}

interface Props {
  initial?: Note
  onSave: (data: Omit<Note, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

const inp: React.CSSProperties = {
  width: '100%',
  background: 'rgba(35,31,26,.04)',
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

export default function NoteForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm]   = useState<FormData>(noteToForm(initial))
  const [typeOpen, setTypeOpen] = useState(false)
  const [images, setImages] = useState<string[]>(
    (initial?.body ?? []).filter((b: any) => typeof b !== 'string' && b.type === 'image').map((b: any) => b.url)
  )
  const [saving, setSaving]               = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  const imagesRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleImagesUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingImages(true)
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const ext  = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabaseBrowser.storage.from('notes').upload(path, file)
        if (error) throw error
        return supabaseBrowser.storage.from('notes').getPublicUrl(path).data.publicUrl
      }))
      setImages(imgs => [...imgs, ...urls])
    } catch { alert('Upload failed') }
    setUploadingImages(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      type:    form.type,
      date:    form.date,
      title:   form.title,
      sub:     form.sub,
      body: [
        ...form.body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean).map(content => ({ type: 'text' as const, content })),
        ...images.map(url => ({ type: 'image' as const, url })),
      ],
      private: form.private,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="adm-form-grid2">
        <div>
          <label style={lbl}>Type</label>
          <div style={{ position: 'relative' }}>
            {typeOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setTypeOpen(false)} />}
            <button type="button" onClick={() => setTypeOpen(o => !o)}
              style={{ ...inp, marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 36, position: 'relative', cursor: 'pointer', textAlign: 'left' }}>
              {form.type}
              <ChevronDown size={16} strokeWidth={1.5} style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${typeOpen ? 180 : 0}deg)`, transition: 'transform .2s', pointerEvents: 'none', color: 'rgba(35,31,26,.45)' }} />
            </button>
            {typeOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100, background: '#fff', border: '1px solid rgba(35,31,26,.12)', borderRadius: 13, overflow: 'hidden', boxShadow: '0 4px 16px rgba(35,31,26,.1)', minWidth: '100%' }}>
                {TYPES.map(t => (
                  <button key={t} type="button"
                    onClick={() => { setForm(f => ({ ...f, type: t, ...(t === '일상' && !f.private ? { private: true } : {}) })); setTypeOpen(false) }}
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
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={lbl}>Title</label>
        <input style={inp} value={form.title} onChange={set('title')} required />
      </div>

      <label style={lbl}>Subtitle</label>
      <input style={inp} value={form.sub} onChange={set('sub')} />

      <label style={lbl}>Body (단락 사이 빈 줄로 구분)</label>
      <textarea style={{ ...inp, height: 480, resize: 'none', overflowY: 'auto', lineHeight: 1.7 }} value={form.body} onChange={set('body')} />

      {/* Images */}
      <label style={lbl}>Images (선택)</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
        {images.map((url, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={url} alt="" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 13, border: '1px solid rgba(35,31,26,.12)' }} />
            <button type="button"
              onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
              style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
              <CircleX size={32} strokeWidth={1} fill="#F33838" color="#fff" />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => imagesRef.current?.click()} disabled={uploadingImages}
          style={{ ...uploadBtn, width: 160, height: 120, borderRadius: 13, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploadingImages ? 'Uploading…' : '↑ Upload'}
        </button>
        <input ref={imagesRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImagesUpload} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <label style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => setForm(f => ({ ...f, private: !f.private }))}>
          {form.private
            ? <CheckSquare size={20} strokeWidth={1.5} color={INK} />
            : <Square size={20} strokeWidth={1.5} color="rgba(35,31,26,.35)" />}
          비공개
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving}
            style={{ background: '#FFD270', color: INK, border: 'none', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer' }}>
            {saving ? 'Saving…' : (initial ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={onCancel}
            style={{ background: 'transparent', color: `rgba(35,31,26,.5)`, border: '1px solid rgba(35,31,26,.2)', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
