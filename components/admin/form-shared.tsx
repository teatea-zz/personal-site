'use client'

// 작업물 · 노트 폼 공용 — 저장 시점 업로드 · 글 임시 저장 · 나가기 전 확인 · 세그먼트 버튼
import { useEffect, useRef, useState } from 'react'
import { CircleX } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { optimizeImage } from '@/lib/image-convert'

const INK  = '#231F1A'
const suit = "'SUIT Variable',sans-serif"

export const LEAVE_MESSAGE = '저장하지 않은 변경이 있어요. 나갈까요?\n(글은 임시 저장돼 있어서 다시 열면 불러올 수 있어요)'

// ── 이미지: 고르는 순간엔 브라우저에만 보관, Create / Update 때 업로드 ──────────────
/** url: 저장된 이미지 주소 또는 아직 안 올린 파일의 미리보기 주소(blob:) / file: 아직 안 올린 파일 */
export type ImgItem = { url: string; file?: File }

export const toItems = (urls: string[]): ImgItem[] => urls.map(url => ({ url }))
export const pickFiles = (files: FileList | null): ImgItem[] =>
  Array.from(files ?? []).map(file => ({ url: URL.createObjectURL(file), file }))
export const revoke = (items: ImgItem[]) => items.forEach(i => i.file && URL.revokeObjectURL(i.url))

type Bucket = 'works' | 'notes'

/** Supabase에 올린 파일만 골라 삭제 (외부 URL · 미리보기 주소는 무시) */
export async function removeFromStorage(bucket: Bucket, urls: string[]) {
  const paths = urls.map(u => u.split(`/${bucket}/`)[1]).filter(Boolean)
  if (paths.length) await supabaseBrowser.storage.from(bucket).remove(paths)
}

async function uploadOne(bucket: Bucket, original: File): Promise<string> {
  const file = await optimizeImage(original) // 긴 변 2560px · WebP 90%
  const ext  = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabaseBrowser.storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return supabaseBrowser.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

/**
 * 아직 안 올린 이미지들을 순서대로 업로드해 최종 주소 목록을 돌려줌.
 * 하나라도 실패하면 이번에 올린 파일을 지우고 throw → 글은 저장되지 않고 폼은 그대로.
 * uploaded: 이번에 새로 올린 주소 (글 저장이 실패하면 호출한 쪽에서 정리)
 */
export async function uploadPending(
  bucket: Bucket, groups: ImgItem[][], onProgress: (done: number, total: number) => void,
): Promise<{ urls: string[][]; uploaded: string[] }> {
  const total = groups.flat().filter(i => i.file).length
  const uploaded: string[] = []
  let done = 0
  try {
    const urls: string[][] = []
    for (const group of groups) {
      const out: string[] = []
      for (const item of group) {
        if (!item.file) { out.push(item.url); continue }
        onProgress(done, total)
        const url = await uploadOne(bucket, item.file)
        uploaded.push(url)
        out.push(url)
        done++
      }
      urls.push(out)
    }
    return { urls, uploaded }
  } catch (e) {
    await removeFromStorage(bucket, uploaded).catch(() => {})
    throw e
  }
}

// ── 글 임시 저장 (브라우저 localStorage) ─────────────────────────────────────
// 입력할 때마다 자동 보관, 저장 성공 시 삭제. 다시 열었을 때 남아 있으면 불러올지 묻는 배너 표시
export function useDraft<T>(key: string, value: T, initial: T) {
  const [pending, setPending] = useState<T | null>(null) // 불러올지 결정 전인 임시 저장본
  const decided = useRef(false)

  // 처음 열 때: 원래 내용과 다른 임시 저장본이 있으면 배너
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw && raw !== JSON.stringify(initial)) setPending(JSON.parse(raw))
      else decided.current = true
    } catch { decided.current = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // 입력할 때마다 0.5초 뒤 보관 (배너에서 결정하기 전엔 기존 임시 저장본을 덮어쓰지 않음)
  useEffect(() => {
    if (!decided.current) return
    const t = setTimeout(() => {
      try {
        const s = JSON.stringify(value)
        if (s === JSON.stringify(initial)) localStorage.removeItem(key)
        else localStorage.setItem(key, s)
      } catch { /* 저장 공간 막힘 · 시크릿 모드 등 — 무시 */ }
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, JSON.stringify(value)])

  return {
    pending,
    restore: (apply: (v: T) => void) => { if (pending) apply(pending); setPending(null); decided.current = true },
    discard: () => { try { localStorage.removeItem(key) } catch {} setPending(null); decided.current = true },
    clear:   () => { try { localStorage.removeItem(key) } catch {} },
  }
}

export function DraftBanner({ onRestore, onDiscard }: { onRestore: () => void; onDiscard: () => void }) {
  const btn: React.CSSProperties = { fontFamily: suit, fontSize: 'var(--fs-label)' as any, padding: 'var(--space-8) var(--space-16)', borderRadius: 'var(--radius-8)', cursor: 'pointer' }
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-12)', flexWrap: 'wrap', padding: 'var(--space-12) var(--space-16)', marginBottom: 'var(--space-16)', borderRadius: 'var(--radius-12)', background: 'rgba(255,112,41,.08)', border: '1px solid rgba(255,112,41,.35)' }}>
      <span style={{ fontFamily: suit, fontSize: 'var(--fs-label)' as any, color: INK }}>저장하지 않은 임시 글이 있어요. 불러올까요?</span>
      <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
        <button type="button" onClick={onRestore} style={{ ...btn, border: `1px solid ${INK}`, background: INK, color: '#FDFBF7', fontWeight: 700 }}>불러오기</button>
        <button type="button" onClick={onDiscard} style={{ ...btn, border: '1px solid rgba(35,31,26,.2)', background: 'transparent', color: 'rgba(35,31,26,.6)' }}>삭제</button>
      </div>
    </div>
  )
}

// ── 나가기 전 확인: 변경이 있으면 탭 닫기 · 새로고침도 브라우저 확인 창 ─────────────
export function useLeaveGuard(dirty: boolean, onDirtyChange?: (dirty: boolean) => void) {
  useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])
  useEffect(() => {
    if (!dirty) return
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', h)
    return () => window.removeEventListener('beforeunload', h)
  }, [dirty])
}

// ── 이미지 썸네일 목록 + 드래그로 순서 바꾸기 ─────────────────────────────────
// 마우스: 썸네일 어디서나 끌기 / 터치: 왼쪽 아래 손잡이(⠿)로만 끌기 — 썸네일을 짚고 스크롤하는 건 그대로 되게
// 끄는 동안 손가락 · 커서 아래 썸네일 자리로 바로 옮겨 보여줌 (놓으면 그 순서로 확정, 저장은 Create / Update 때)
export function SortableThumbs({ items, setItems, onPick }: {
  items: ImgItem[]
  setItems: React.Dispatch<React.SetStateAction<ImgItem[]>>
  onPick: () => void
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  useEffect(() => {
    if (dragIdx === null) return
    const move = (e: PointerEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-thumb]') as HTMLElement | null
      if (!el) return
      const to = Number(el.dataset.thumb)
      if (to === dragIdx) return
      setItems(list => { const next = [...list]; const [m] = next.splice(dragIdx, 1); next.splice(to, 0, m); return next })
      setDragIdx(to)
    }
    const end = () => setDragIdx(null)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
    }
  }, [dragIdx, setItems])

  function start(i: number, e: React.PointerEvent) {
    const t = e.target as HTMLElement
    if (t.closest('[data-remove]')) return                        // ✕ 버튼은 삭제만
    if (e.pointerType === 'mouse' ? e.button !== 0 : !t.closest('[data-handle]')) return
    e.preventDefault()
    setDragIdx(i)
  }

  return (
    <div style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 'var(--space-16)', userSelect: dragIdx !== null ? 'none' : undefined }}>
      {items.map((item, i) => (
        <div key={item.url} data-thumb={i} onPointerDown={e => start(i, e)}
          style={{ position: 'relative', cursor: dragIdx !== null ? 'grabbing' : 'grab' }}>
          {/* 끄는 중인 이미지: 액센트(Update 버튼과 같은 라임) 4px 외곽선 — outline이라 크기 · 배치가 변하지 않음 */}
          <img src={item.url} alt="" draggable={false} style={{
            width: 160, height: 120, objectFit: 'cover', borderRadius: 'var(--radius-12)', border: '1px solid rgba(35,31,26,.12)', display: 'block',
            outline: dragIdx === i ? '4px solid var(--accent)' : 'none', outlineOffset: 0,
          }} />
          {/* 터치용 손잡이 (마우스는 썸네일 어디서나 끌기) */}
          <span data-handle aria-hidden="true"
            style={{ position: 'absolute', left: 8, bottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 24, borderRadius: 'var(--radius-pill)', background: 'rgba(35,31,26,.72)', color: '#FDFBF7', fontFamily: suit, fontSize: 13, touchAction: 'none' }}>
            ⠿
          </span>
          {/* 화면에서만 빼고, 실제 파일 삭제는 저장 성공 후 */}
          <button type="button" data-remove aria-label={`${i + 1}번째 이미지 빼기`}
            onClick={() => { revoke([item]); setItems(list => list.filter((_, j) => j !== i)) }}
            style={{ position: 'absolute', top: -10, right: -10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}>
            <CircleX size={32} strokeWidth={1} fill="#F33838" color="#fff" />
          </button>
        </div>
      ))}
      <button type="button" onClick={onPick}
        style={{ flexShrink: 0, background: 'rgba(35,31,26,.06)', border: '1px dashed rgba(35,31,26,.18)', borderRadius: 'var(--radius-12)', color: INK, fontFamily: "'Geist',ui-monospace,monospace", fontSize: 'var(--fs-btn)' as any, cursor: 'pointer', whiteSpace: 'nowrap', width: 160, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ↑ Upload
      </button>
    </div>
  )
}

// ── 세그먼트 버튼 (노트 Layout · 작업물 Gallery 단 수) — 입력칸과 같은 높이 · 선택은 반전 ──
export function Segmented<V extends string | number>({ label, value, options, onChange }: {
  label: string; value: V; options: { value: V; label: string }[]; onChange: (v: V) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid rgba(35,31,26,.15)', borderRadius: 'var(--radius-12)', background: '#FFFFFF' }}>
      {options.map(o => {
        const on = value === o.value
        return (
          <button key={String(o.value)} type="button" role="radio" aria-checked={on} onClick={() => onChange(o.value)}
            style={{
              flex: 1, whiteSpace: 'nowrap', padding: 'var(--space-8) var(--space-8)', borderRadius: 'var(--radius-8)', border: 0, cursor: 'pointer',
              fontFamily: suit, fontSize: 'var(--fs-label)' as any, fontWeight: on ? 700 : 500,
              background: on ? INK : 'transparent', color: on ? '#FDFBF7' : 'rgba(35,31,26,.6)',
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
