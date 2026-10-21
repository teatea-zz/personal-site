'use client'

import { ArrowUpRight } from 'lucide-react'
import type { Note } from '@/types/database'
import { T } from '@/lib/theme'

// SamePage 링크 주소 — 여기에 URL을 넣으세요
const SAMEPAGE_URL = ''

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log', '회고': 'Retro', '일상': 'Daily' }

interface Props {
  recentNotes: Note[]
  onOpenNote: (i: number) => void
  onOpenView: (v: string) => void
  isAdmin: boolean
  onSecretLogin: () => void
  onLogout: () => void
}

export default function HomeCard({ recentNotes, onOpenNote, onOpenView, isAdmin, onSecretLogin, onLogout }: Props) {
  return (
    <div style={{ position: 'relative', zIndex: 3, width: 'min(100%,448px)' }}>
      <div style={{
        background: T.heroBg,
        backdropFilter: 'blur(22px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.1)',
        border: `1px solid ${T.heroBorder}`,
        borderRadius: 14,
        padding: 'clamp(20px,5.5vw,24px)',
        color: T.heroText,
        boxShadow: T.heroShadow,
      }}>
        <h1 style={{ fontFamily: "'Geist',ui-monospace,monospace", fontWeight: 800, fontSize: 'clamp(50px,17.5vw,96px)', lineHeight: 1, letterSpacing: '-.02em', margin: 0, whiteSpace: 'nowrap', color: '#FF7029' }}>lalahyun</h1>

        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13.5, fontWeight: 450, lineHeight: 1.65, color: T.heroTextDim, margin: '16px 0 4px', maxWidth: '44ch' }}>
          UX/UI DESIGNER<br />
          기술이 발전할수록 좁아지는 선택지 앞에서,<br />
          디지털이 낯선 사람도 선택할 수 있는 대안을 만듭니다.<br />
          <img
            src="https://samepage-book.vercel.app/icon.png"
            alt=""
            width={16}
            height={16}
            style={{ display: 'inline-block', width: 16, height: 16, verticalAlign: '-3px', marginRight: 6 }}
          />
          {' '}
          <a
            href={SAMEPAGE_URL || 'https://samepage-book.vercel.app/'}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-accent"
            style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            SamePage &apos;우리는 지금 같은 페이지에 있네요&apos;
          </a>
        </p>

        <div style={{ marginTop: 16, borderTop: `1px solid ${T.heroHairline}` }}>
          {recentNotes.map((note, i) => (
            <button
              key={note.id}
              onClick={() => onOpenNote(i)}
              className="hover-accent home-note"
              style={{
                width: '100%',
                textAlign: 'left',
                border: 0,
                borderBottom: `1px solid ${T.heroHairline}`,
                padding: '16px 14px',
                cursor: 'pointer',
                display: 'block',
                color: T.heroText,
                transition: 'background .15s,color .15s',
                background: 'transparent',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
                <span style={{
                  fontFamily: "'Geist',ui-monospace,monospace",
                  fontSize: 12, fontWeight: 500,
                  color: 'currentColor',
                }}>{note.date}</span>
                <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 450, color: 'currentColor', opacity: .75 }}>
                  {TYPE_EN[note.type] || note.type}
                </span>
              </div>
              <div style={{
                fontFamily: "'SUIT Variable',sans-serif",
                fontSize: 15, fontWeight: 600, marginTop: 5,
                color: 'currentColor',
              }}>
                {note.title}
                {/* 비공개 마커 — 관리자 세션에서만 노출되는 글 */}
                {note.private && <span aria-label="비공개" style={{ display: 'inline-block', width: 4, height: 4, borderRadius: '50%', background: '#FF6D19', marginLeft: 3, verticalAlign: 'text-top' }} />}
              </div>            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 16 }}>
          {(['work', 'about', 'contact', 'index'] as const).map(v => (
            <button
              key={v}
              onClick={() => onOpenView(v)}
              className="hover-accent-border"
              style={{
                appearance: 'none',
                border: `1px solid ${T.heroBtnBorder}`,
                color: T.heroBtnText,
                fontFamily: "'Geist',ui-monospace,monospace",
                fontSize: 14,
                fontWeight: 400,
                textTransform: 'uppercase',
                padding: 13,
                borderRadius: 13,
                cursor: 'pointer',
                transition: '.18s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
              }}
            >
              <span>{v.charAt(0).toUpperCase() + v.slice(1)}</span>
              <ArrowUpRight size={16} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        {/* © 더블클릭 = 숨은 어드민 로그인 입구 (커서 · hover 변화 없음) / 로그인 중엔 Logout 표시 */}
        <div style={{ marginTop: 16, fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, color: T.heroGhost, userSelect: 'none' }}>
          <span onDoubleClick={onSecretLogin}>© lalahyun 2026</span>
          {isAdmin && (
            <>
              {' · '}
              <button
                type="button"
                onClick={onLogout}
                style={{ font: 'inherit', color: '#fff', background: '#FF7029', border: 0, padding: 0, cursor: 'pointer' }}
              >Logout</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
