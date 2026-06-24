'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID ?? 'admin'

const BG   = '#FDFBF7'
const INK  = '#231F1A'
const mono = "'IBM Plex Mono',ui-monospace,monospace"
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
    if (id !== ADMIN_ID) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다')
      setLoading(false)
      return
    }
    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: `${ADMIN_ID}@admin.local`,
      password,
    })
    if (error) {
      setError('아이디 또는 비밀번호가 올바르지 않습니다')
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
    borderRadius: 13,
    padding: '10px 14px',
    color: INK,
    fontFamily: suit,
    fontSize: 'clamp(14px,1vw,16px)' as any,
    outline: 'none',
    marginBottom: 16,
  }

  return (
    <div style={{ minHeight: '100svh', background: BG, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360, background: '#fff', border: `1px solid rgba(35,31,26,.1)`, borderRadius: 13, padding: 'clamp(24px,5vw,32px)' as any, boxShadow: '0 4px 24px rgba(35,31,26,.07)' }}>
        <div style={{ fontFamily: mono, fontSize: 'clamp(9px,0.66vw,10.5px)' as any, letterSpacing: '.16em', color: `rgba(35,31,26,.4)`, marginBottom: 24 }}>ADMIN · JIWOO HAN</div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ fontFamily: suit, fontSize: 13, color: '#c0392b', marginBottom: 16 }}>{error}</div>}
          <label style={{ fontFamily: mono, fontSize: 'clamp(9px,0.63vw,10px)' as any, letterSpacing: '.14em', textTransform: 'uppercase', color: `rgba(35,31,26,.45)`, display: 'block', marginBottom: 6 }}>ID</label>
          <input style={inputStyle} type="text" value={id} onChange={e => setId(e.target.value)} required autoFocus autoComplete="username" />
          <label style={{ fontFamily: mono, fontSize: 'clamp(9px,0.63vw,10px)' as any, letterSpacing: '.14em', textTransform: 'uppercase', color: `rgba(35,31,26,.45)`, display: 'block', marginBottom: 6 }}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#ffd270', color: INK, border: 'none', borderRadius: 13, padding: 12, fontFamily: mono, fontSize: 'clamp(11px,0.75vw,12px)' as any, fontWeight: 600, letterSpacing: '.08em', cursor: 'pointer' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
