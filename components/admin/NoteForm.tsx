'use client'

import { useState } from 'react'
import type { Note } from '@/types/database'

const TYPES = ['노트', '초고', '습작', '독서', '로그']
const INK   = '#231F1A'
const mono  = "'IBM Plex Mono',ui-monospace,monospace"
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
    type:       note?.type       ?? '노트',
    date:       note?.date       ?? today(),
    title:      note?.title      ?? '',
    sub:        note?.sub        ?? '',
    body:       (note?.body ?? []).join('\n\n'),
    private:    note?.private    ?? false,
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

export default function NoteForm({ initial, onSave, onCancel }: Props) {
  const [form, setForm] = useState<FormData>(noteToForm(initial))
  const [saving, setSaving] = useState(false)

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      type:       form.type,
      date:       form.date,
      title:      form.title,
      sub:        form.sub,
      body:       form.body.split(/\n{2,}/).map(p => p.trim()).filter(Boolean),
      private:    form.private,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="adm-form-grid2">
        <div>
          <label style={lbl}>Type</label>
          <select style={{ ...inp, marginBottom: 0 }} value={form.type} onChange={set('type')}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
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

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
        <label style={{ ...lbl, marginBottom: 0, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.private} onChange={e => setForm(f => ({ ...f, private: e.target.checked }))} />
          Private
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving}
            style={{ background: '#ffd270', color: INK, border: 'none', borderRadius: 13, padding: '10px 22px', fontFamily: mono, fontSize: 'var(--fs-btn)' as any, fontWeight: 600, cursor: 'pointer' }}>
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
