'use client'

import type { Note } from '@/types/database'
import { T } from '@/lib/theme'

const TYPE_EN: Record<string, string> = { '노트': 'Note', '초고': 'Draft', '습작': 'Study', '독서': 'Reading', '로그': 'Log', '회고': 'Retro', '일상': 'Daily' }

interface Props {
  note: Note
  noteNum: string
  onLightbox: (src: string) => void
}

const pStyle: React.CSSProperties = { fontFamily: "'SUIT Variable',sans-serif", fontSize: 16, lineHeight: 1.8, color: T.textBody, margin: 0 }

// 노트 상세 — layout에 따라 3가지 (노트 편집 폼에서 선택, 습작 · 일상 기본 이미지 2단)
//  text    글: 글 → 이미지 (기존)
//  image-1 이미지 1단 / image-2 이미지 2단: 작업물 상세와 같은 좌우 구조 (globals.css .work-split 재사용)
export default function NoteArticle({ note, onLightbox }: Props) {
  const typeEn = TYPE_EN[note.type] || note.type
  const layout = note.layout ?? 'text'
  const images = note.images ?? []
  const paragraphs = note.body.map((block: any) => (typeof block === 'string' ? block : block.content)).filter(Boolean) // eslint-disable-line @typescript-eslint/no-explicit-any

  const header = (titleSize: string) => (
    <>
      <div style={{ fontSize: 12, color: T.textFaint, display: 'flex', alignItems: 'baseline', gap: 0 }}>
        <span style={{ fontFamily: "'Geist',ui-monospace,monospace" }}>{note.date} · {typeEn}</span>
        {note.private && (
          <span style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontWeight: 600, letterSpacing: '.01em' }}> · 비공개</span>
        )}
      </div>
      <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: titleSize, lineHeight: 1.12, letterSpacing: '-.025em', margin: '14px 0 6px', color: T.heading }}>
        {note.title}
      </h2>
      <div style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 14, color: T.textMuted, marginBottom: 26 }}>{note.sub}</div>
    </>
  )
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {paragraphs.map((p: string, i: number) => <p key={i} style={pStyle}>{p}</p>)}
    </div>
  )

  // 이미지 1단 / 2단 — 작업물 상세와 같은 좌 이미지(스크롤) / 우 글(고정) 구조
  //   1단: 16:9 프레임 한 줄씩 / 2단: 정사각형 2단 그리드 (모바일도 2단)
  //   이미지는 잘리지 않게 contain + 잉크색 여백, 클릭 시 라이트박스 / 모바일 순서: 글 → 이미지
  if (layout === 'image-1' || layout === 'image-2') {
    const cols = layout === 'image-1' ? 1 : 2
    return (
      <article className="work-split">
        <div className="work-media">
          <div className="work-gallery-wrap">
            <div className="work-gallery" data-cols={cols} style={{ display: 'grid', gap: 14 }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => onLightbox(src)} style={{ width: '100%', padding: 0, border: 0, cursor: 'zoom-in', display: 'block', background: 'transparent' }}>
                  <div style={{ aspectRatio: cols === 1 ? '16/9' : '1/1', overflow: 'hidden', borderRadius: 10, border: `1px solid ${T.hairline}`, background: '#231F1A' }}>
                    <div className="gallery-img" style={{ width: '100%', height: '100%', backgroundImage: `url("${src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
                  </div>
                </button>
              ))}
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
