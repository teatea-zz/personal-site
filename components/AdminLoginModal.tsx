'use client'

import { useEffect, useState } from 'react'
import { signInAdmin } from '@/lib/admin-actions'

const INK  = '#231F1A'
const mono = "'Geist',ui-monospace,monospace"
const suit = "'SUIT Variable',sans-serif"

interface Props {
  open: boolean
  onClose: () => void
}

// 메인 사이트용 어드민 로그인 창 — 홈카드 © 더블클릭으로 열림 (어드민 /admin/login과 같은 로직)
export default function AdminLoginModal({ open, onClose }: Props) {
  const [id, setId]             = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!open) { setPassword(''); setError(''); return }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await signInAdmin(id, password)
    setLoading(false)
    if (err) { setError(err); return }
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(35,31,26,.05)',
    border: '1px solid rgba(35,31,26,.18)',
    borderRadius: 'var(--radius-12)',
    padding: 'var(--space-12) var(--space-16)',
    color: INK,
    fontFamily: suit,
    fontSize: 14,
    outline: 'none',
    marginBottom: 'var(--space-16)',
  }
  const labelStyle: React.CSSProperties = { fontFamily: mono, fontSize: 14, color: 'rgba(35,31,26,.45)', display: 'block', marginBottom: 'var(--space-8)' }

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(35,31,26,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-16)' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin sign in"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 340, background: '#FDFBF7', border: '1px solid rgba(35,31,26,.1)', borderRadius: 'var(--radius-12)', padding: 'var(--space-28)', boxShadow: '0 24px 70px -30px rgba(35,31,26,.4)' }}
      >
        <form onSubmit={handleSubmit}>
          {error && <div style={{ fontFamily: suit, fontSize: 13, color: '#c0392b', marginBottom: 'var(--space-16)' }}>{error}</div>}
          <label style={labelStyle}>ID</label>
          <input style={inputStyle} type="text" value={id} onChange={e => setId(e.target.value)} required autoFocus autoComplete="username" />
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button type="submit" disabled={loading}
              style={{ flex: 1, background: 'var(--accent)', color: INK, border: 'none', borderRadius: 'var(--radius-12)', padding: 'var(--space-12)', fontFamily: mono, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button type="button" onClick={onClose}
              style={{ background: 'transparent', color: 'rgba(35,31,26,.5)', border: '1px solid rgba(35,31,26,.2)', borderRadius: 'var(--radius-12)', padding: 'var(--space-12) var(--space-16)', fontFamily: mono, fontSize: 14, cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
