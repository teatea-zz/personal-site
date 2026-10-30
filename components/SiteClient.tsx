'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import type { Note, Work } from '@/types/database'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { fetchAllNotes, fetchAllWorks, signOutAdmin } from '@/lib/admin-actions'
import HomeCard from './HomeCard'
import AdminLoginModal from './AdminLoginModal'
import Sheet from './Sheet'
import Lightbox from './Lightbox'
import SocialBar from './SocialBar'
import SpotifyPlayer from './SpotifyPlayer'
import GradientBackground from './GradientBackground'
import BreathVisual from './BreathVisual'
import BreathVisual2 from './BreathVisual2'
import BreathVisual3 from './BreathVisual3'
import BreathVisual4 from './BreathVisual4'
import { T, AMBIENT_VISUALS } from '@/lib/theme'

const BG_SRC = '/HomeCard_BG/kate-trifo-J4OImNkqDLQ-unsplash.jpg'

type View = 'work' | 'project' | 'note' | 'about' | 'contact' | 'index' | null


interface Props {
  notes: Note[]
  works: Work[]
}

const HAS_SUPABASE =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

export default function SiteClient({ notes, works }: Props) {
  const [view, setView] = useState<View>(null)
  const [noteIndex, setNoteIndex] = useState(0)
  const [projIndex, setProjIndex] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)

  // 서버는 공개 노트 · 작업물만 내려줌 — 같은 브라우저에 어드민 로그인 세션이 있으면
  // RLS가 허용하는 비공개 포함 전체를 다시 불러온다 (방문자에겐 아무 일도 없음)
  const [allNotes, setAllNotes] = useState<Note[]>(notes)
  const [allWorks, setAllWorks] = useState<Work[]>(works)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  // 시트에서 추가 · 수정 · 삭제 후 최신 목록 재조회 (새 목록을 반환해 시트가 위치를 다시 찾게 함)
  const refresh = useCallback(async () => {
    const [n, w] = await Promise.all([fetchAllNotes(), fetchAllWorks()])
    const nextNotes = n ?? allNotes
    const nextWorks = w ?? allWorks
    setAllNotes(nextNotes)
    setAllWorks(nextWorks)
    return { notes: nextNotes, works: nextWorks }
  }, [allNotes, allWorks])

  // 로그인 / 로그아웃을 즉시 반영 — 로그인 시 비공개 포함 재조회, 로그아웃 시 공개 노트로 복귀
  useEffect(() => {
    if (!HAS_SUPABASE) return
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
      if (session) {
        fetchAllNotes().then(rows => { if (rows?.length) setAllNotes(rows) })
        fetchAllWorks().then(rows => { if (rows?.length) setAllWorks(rows) })
      } else {
        setAllNotes(notes)
        setAllWorks(works)
      }
    })
    return () => subscription.unsubscribe()
  }, [notes, works])

  const logout = async () => { await signOutAdmin() }

  const openNote = (i: number) => { setNoteIndex(i); setView('note') }
  const openView = (v: string) => setView(v as View)
  const openProject = (i: number) => { setProjIndex(i); setView('project') }

  return (
    <div style={{ position: 'relative', minHeight: '100svh', background: T.pageBg }}>
      {/* Hero section */}
      <section style={{
        position: 'relative',
        minHeight: '100svh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 'clamp(var(--space-16),3vw,var(--space-40))',
      }}>
        {/* 라이트 모드 배경 사진 */}
        {!AMBIENT_VISUALS && (
          <>
            {/* 레이어 합성 (아래→위): 1. 원본 / 2. White Overlay 30% / 3. 원본 Color Burn 10% / 4~5. 컬러 Soft Light
                isolation으로 블렌딩이 이 묶음 안에서만 일어나게 함 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, isolation: 'isolate', pointerEvents: 'none' }}>
              <Image src={BG_SRC} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: '#fff', mixBlendMode: 'overlay', opacity: .3 }} />
              <Image src={BG_SRC} alt="" fill priority sizes="100vw" style={{ objectFit: 'cover', mixBlendMode: 'color-burn', opacity: .1 }} />
              {/* 4. #EF7452 Soft Light 16% / 5. #52E3EF Soft Light 30% */}
              <div style={{ position: 'absolute', inset: 0, background: '#EF7452', mixBlendMode: 'soft-light', opacity: .16 }} />
              <div style={{ position: 'absolute', inset: 0, background: '#52E3EF', mixBlendMode: 'soft-light', opacity: .3 }} />
            </div>
            {/* 사진 출처 — 홈카드와 겹치는 좁은 화면(≤680px)에선 숨김 (globals.css .photo-credit) */}
            <p className="photo-credit" style={{
              position: 'fixed', top: 'clamp(12px,2vw,28px)', right: 'clamp(12px,2vw,28px)', zIndex: 20,
              margin: 0, padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-8)',
              background: 'rgba(254,253,251,.55)',
              backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
              fontFamily: "'SUIT Variable',sans-serif", fontSize: 11, color: T.heroTextDim,
            }}>
              사진:{' '}
              <a href="https://unsplash.com/ko/%EC%82%AC%EC%A7%84/%EB%82%AE-%EB%8F%99%EC%95%88-%ED%95%B4%EB%B3%80%EC%97%90%EC%84%9C-%EC%88%98%EC%98%81%ED%95%98%EB%8A%94-%EC%82%AC%EB%9E%8C%EB%93%A4-J4OImNkqDLQ?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Unsplash</a>의{' '}
              <a href="https://unsplash.com/ko/@katetrifo?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Kate Trifo</a>
            </p>
          </>
        )}

        {/* 다크 모드 전용 앰비언트 비주얼 — lib/theme.ts MODE='dark'로 복원 */}
        {AMBIENT_VISUALS && (
          <>
            <GradientBackground />
            <BreathVisual />
            <BreathVisual2 />
            <BreathVisual3 />
            <BreathVisual4 />
            {/* Grain overlay */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', mixBlendMode: 'overlay', opacity: .15,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            }} />
          </>
        )}

        <HomeCard
          recentNotes={allNotes.slice(0, 3)}
          onOpenNote={openNote}
          onOpenView={openView}
          isAdmin={isAdmin}
          onSecretLogin={() => { if (HAS_SUPABASE && !isAdmin) setLoginOpen(true) }}
          onLogout={logout}
        />
        {/* 데스크톱: 플로팅(fixed) / 모바일: 이 위치(홈카드 아래)에 흐름 배치 */}
        <SpotifyPlayer />

        <SocialBar />
      </section>

      {/* Sheet panel */}
      <Sheet
        view={view}
        noteIndex={noteIndex}
        projIndex={projIndex}
        notes={allNotes}
        works={allWorks}
        isAdmin={isAdmin}
        onRefresh={refresh}
        onClose={() => setView(null)}
        onOpenNote={openNote}
        onOpenProject={openProject}
        onBackToWork={() => setView('work')}
        onOpenIndex={() => setView('index')}
        onLightbox={setLightbox}
      />

      {/* Lightbox */}
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

      <AdminLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
