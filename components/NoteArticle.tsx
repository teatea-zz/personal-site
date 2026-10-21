'use client'

import type { Note } from '@/types/database'
import { T } from '@/lib/theme'
import { GalleryItem } from './WorkDetail'


interface Props {
  note: Note
  noteNum: string
  onLightbox: (src: string) => void
}

// 본문 크기는 노트 폼 입력칸과 같게 (globals.css --fs-body: 20 / 18 / 16 / 16px)
const pStyle: React.CSSProperties = { fontFamily: "'SUIT Variable',sans-serif", fontSize: 'var(--fs-body)', lineHeight: 1.8, color: T.textBody, margin: 0 }

// 노트 상세 — layout에 따라 3가지 (노트 편집 폼에서 선택, 습작 · 일상 기본 이미지 2단)
//  text    글: 글 → 이미지 (기존)
//  image-1 · 2 · 3 사진 1 · 2 · 3단: 작업물 상세와 같은 좌우 구조 (globals.css .work-split 재사용)
export default function NoteArticle({ note, onLightbox }: Props) {
  const layout = note.layout ?? 'text'
  const images = note.images ?? []
  const paragraphs = note.body.map((block: any) => (typeof block === 'string' ? block : block.content)).filter(Boolean) // eslint-disable-line @typescript-eslint/no-explicit-any

  // 제목 그룹(날짜 · 제목 · 부제)과 본문 사이 48px — 문단 간격(18px) · 본문 한 줄 높이(약 29~36px)보다 넓게 띄워 그룹을 구분
  const header = (titleSize: string) => (
    <div style={{ marginBottom: 48 }}>
      <div style={{ fontSize: 12, color: T.textFaint, display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ fontFamily: "'Geist',ui-monospace,monospace" }}>{note.date}</span>{/* 타입은 시트 제목 경로(INDEX / Daily)에 있어 생략 */}
        {note.private && (
          <span style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontWeight: 600, letterSpacing: '.01em' }}> · 비공개</span>
        )}
      </div>
      <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: titleSize, lineHeight: 1.12, letterSpacing: '-.025em', margin: '14px 0 0', color: T.heading }}>
        {note.title}
      </h2>
      {/* 부제 15px · 잉크 62% (크림 배경 대비 4.59:1, AA 통과) — 없으면 자리도 차지하지 않음 */}
      {note.sub && <div style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, color: T.textDim, marginTop: 12 }}>{note.sub}</div>}
    </div>
  )
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {paragraphs.map((p: string, i: number) => <p key={i} style={pStyle}>{p}</p>)}
    </div>
  )

  // 사진 1·2·3단 — 작업물 상세와 같은 좌 이미지(스크롤) / 우 글(고정) 구조
  //   1단: 16:9 칸 한 줄씩 / 2·3단: 원본 비율 그리드 (모바일은 최대 2단) — 작업물 갤러리와 같은 GalleryItem
  //   클릭 시 라이트박스 / 모바일 순서: 글 → 이미지
  if (layout !== 'text') {
    const cols = layout === 'image-1' ? 1 : layout === 'image-2' ? 2 : 3 // 3단은 모바일에서 2단 (.work-gallery)
    return (
      <article className="work-split">
        <div className="work-media">
          <div className="work-gallery-wrap">
            <div className="work-gallery" data-cols={cols} style={{ display: 'grid', gap: 14, alignItems: 'start' }}>
              {images.map((src, i) => <GalleryItem key={i} src={src} cols={cols} onClick={() => onLightbox(src)} />)}
            </div>
          </div>
        </div>
        <div className="work-info">
          <div className="work-info-inner">
            {header('clamp(28px,2.6vw,38px)')}
            {body}
          </div>
        </div>
      </article>
    )
  }

  // 글 (기본)
  return (
    <article style={{ maxWidth: 720, margin: '0 auto' }}>
      {header('clamp(28px,4.6vw,46px)')}
      {body}
      {images.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24, alignItems: 'flex-start' }}>
          {images.map((url, i) => <img key={i} src={url} alt="" style={{ maxWidth: '100%', height: 'auto', borderRadius: 10, display: 'block' }} />)}
        </div>
      )}
    </article>
  )
}
