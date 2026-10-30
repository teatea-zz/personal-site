'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { signInAdmin } from '@/lib/admin-actions'

const BG   = '#FDFBF7'
const INK  = '#231F1A'
const mono = "'Geist',ui-monospace,monospace"
const suit = "'SUIT Variable',sans-serif"

export default function LoginPage() {
  const router = useRouter()
  const [id, setId]           = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const err = await signInAdmin(id, password)
    if (err) {
      setError(err)
      setLoading(false)
      return
    }
    router.push('/admin')
    router.refresh()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(35,31,26,.05)',
    border: `1px solid rgba(35,31,26,.18)`,
    borderRadius: 'var(--radius-12)',
    padding: 'var(--space-12) var(--space-16)',
    color: INK,
    fontFamily: suit,
    fontSize: 14,
    fontWeight: 400,
    outline: 'none',
    marginBottom: 'var(--space-16)',
  }

  return (
    <div style={{ minHeight: '100svh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-24)' }}>
      <div style={{ width: '100%', maxWidth: 360, background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 'var(--radius-12)', padding: 'clamp(var(--space-24),5vw,var(--space-32))' as any, boxShadow: '0 4px 24px rgba(35,31,26,.07)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-16)' }}>
          <Image src="/admin_logo.svg" alt="Admin Logo" width={140} height={47} priority />
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ fontFamily: suit, fontSize: 13, fontWeight: 400, color: '#c0392b', marginBottom: 'var(--space-16)' }}>{error}</div>}
          <label style={{ fontFamily: mono, fontSize: 14, fontWeight: 400, color: `rgba(35,31,26,.45)`, display: 'block', marginBottom: 'var(--space-8)' }}>ID</label>
          <input style={inputStyle} type="text" value={id} onChange={e => setId(e.target.value)} required autoFocus autoComplete="username" />
          <label style={{ fontFamily: mono, fontSize: 14, fontWeight: 400, color: `rgba(35,31,26,.45)`, display: 'block', marginBottom: 'var(--space-8)' }}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: 'var(--accent)', color: INK, border: 'none', borderRadius: 'var(--radius-12)', padding: 'var(--space-12)', fontFamily: mono, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
