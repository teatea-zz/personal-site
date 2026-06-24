'use client'

import { useState, useRef } from 'react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import type { Work } from '@/types/database'

const INK  = '#231F1A'
const mono = "'IBM Plex Mono',ui-monospace,monospace"
const suit = "'SUIT Variable',sans-serif"

type FormData = {
  title:      string
  year:       string
  role:       string
  field:      string
  tools:      string
  tag:        string
  img:        string
  desc:       string
  gallery:    string
}

function workToForm(work?: Partial<Work>): FormData {
  return {
    title:      work?.title      ?? '',
    year:       work?.year       ?? '',
    role:       work?.role       ?? '',
    field:      work?.field      ?? '',
    tools:      work?.tools      ?? '',
    tag:        work?.tag        ?? '',
    img:        work?.img        ?? '',
    desc:       (work?.description ?? []).join('\n\n'),
    gallery:    (work?.gallery   ?? []).join('\n'),
  }
}

interface Props {
  initial?: Work
  onSave: (data: Omit<Work, 'id' | 'created_at'>) => Promise<void>
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
  outline: 'none',
  marginBottom: 14,
}
const lbl: React.CSSProperties = {
  fontFamily: suit,
  fontSize: 'var(--fs-label)' as any,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
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

async function uploadImage(file: File): Promise<string> {
  const ext  = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabaseBrowser.storage.from('works').upload(path, file)
  if (error) throw error
  return supabaseBrowser.storage.from('works').getPublicUrl(path).data.publicUrl
}

export default function WorkForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm]               = useState<FormData>(workToForm(initial))
  const [saving, setSaving]           = useState(false)
  const [uploadingHero, setUploadingHero]       = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const heroRef    = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingHero(true)
    try { setForm(f => ({ ...f, img: '' })); const url = await uploadImage(file); setForm(f => ({ ...f, img: url })) }
    catch { alert('Upload failed') }
    setUploadingHero(false)
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploadingGallery(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setForm(f => ({ ...f, gallery: [...f.gallery.split('\n').filter(Boolean), ...urls].join('\n') }))
    } catch { alert('Upload failed') }
    setUploadingGallery(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      title:       form.title,
      year:        form.year,
      role:        form.role,
      field:       form.field,
      tools:       form.tools,
      tag:         form.tag,
      img:         form.img,
      description: form.desc.split(/\n{2,}/).map(p => p.trim()).filter(Boolean),
      gallery:     form.gallery.split('\n').map(u => u.trim()).filter(Boolean),
    })
    setSaving(false)
  }

  const galleryUrls = form.gallery.split('\n').filter(Boolean)

  return (
    <form onSubmit={handleSubmit}>
      {/* Row 1: Title / Year / Tag */}
      <div className="adm-form-grid3">
        <div><label style={lbl}>Title</label><input style={{ ...inp, marginBottom: 0 }} value={form.title} onChange={set('title')} required /></div>
        <div><label style={lbl}>Year</label><input style={{ ...inp, marginBottom: 0 }} value={form.year} onChange={set('year')} placeholder="2026" required /></div>
        <div><label style={lbl}>Tag</label><input style={{ ...inp, marginBottom: 0 }} value={form.tag} onChange={set('tag')} placeholder="WEB" required /></div>
      </div>

      {/* Row 2: Role / Field / Tools */}
      <div className="adm-form-grid3eq" style={{ marginTop: 14 }}>
        <div><label style={lbl}>Role</label><input style={{ ...inp, marginBottom: 0 }} value={form.role} onChange={set('role')} required /></div>
        <div><label style={lbl}>Field</label><input style={{ ...inp, marginBottom: 0 }} value={form.field} onChange={set('field')} required /></div>
        <div><label style={lbl}>Tools</label><input style={{ ...inp, marginBottom: 0 }} value={form.tools} onChange={set('tools')} required /></div>
      </div>

      {/* Hero image */}
      <div style={{ marginTop: 14 }}>
        <label style={lbl}>Hero Image</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: form.img ? 10 : 14 }}>
          <input style={{ ...inp, marginBottom: 0, flex: 1 }} value={form.img} onChange={set('img')} placeholder="URL 직접 입력 또는 파일 업로드" />
          <button type="button" onClick={() => heroRef.current?.click()} disabled={uploadingHero} style={uploadBtn}>
            {uploadingHero ? 'Uploading…' : '↑ Upload'}
          </button>
          <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleHeroUpload} />
        </div>
        {form.img && (
          <div style={{ aspectRatio: '16/7', overflow: 'hidden', borderRadius: 13, background: 'rgba(35,31,26,.06)', marginBottom: 14 }}>
            <img src={form.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Description */}
      <label style={lbl}>Description (단락 사이 빈 줄)</label>
      <textarea style={{ ...inp, height: 480, resize: 'none', overflowY: 'auto', lineHeight: 1.7 }} value={form.desc} onChange={set('desc')} />

      {/* Gallery */}
      <label style={lbl}>Gallery</label>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
        {galleryUrls.map((url, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <img src={url} alt="" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 13, border: '1px solid rgba(35,31,26,.12)' }} />
            <button type="button"
              onClick={() => setForm(f => ({ ...f, gallery: f.gallery.split('\n').filter((_, j) => j !== i).join('\n') }))}
              style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#c0392b', border: 'none', color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => galleryRef.current?.click()} disabled={uploadingGallery}
          style={{ ...uploadBtn, width: 160, height: 120, borderRadius: 13, borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {uploadingGallery ? 'Uploading…' : '↑ Upload'}
        </button>
        <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="submit" disabled={saving}
          style={{ background: '#ffd270', color: INK, border: 'none', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer' }}>
          {saving ? 'Saving…' : (initial ? 'Update' : 'Create')}
        </button>
        <button type="button" onClick={onCancel}
          style={{ background: 'transparent', color: 'rgba(35,31,26,.5)', border: '1px solid rgba(35,31,26,.2)', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
