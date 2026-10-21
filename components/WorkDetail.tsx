'use client'

import type { Work } from '@/types/database'
import { T } from '@/lib/theme'

const badge: React.CSSProperties = {
  fontFamily: "'SUIT Variable',sans-serif", fontSize: 12, fontWeight: 600,
  borderRadius: 999, padding: '6px 12px', whiteSpace: 'nowrap',
}

/** 갤러리 이미지 한 칸 (작업물 · 노트 공용)
 *  1단: 16:9 칸 + contain (남는 여백 #E7E5E0)
 *  2·3단: 칸 폭 기준 원본 비율 그대로 (세로형은 세로로, 정사각형은 정사각형으로). 줄 맞춤 배치 — 같은 줄 높이가 다르면 아래가 빔 */
export function GalleryItem({ src, cols, onClick }: { src: string; cols: number; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ width: '100%', padding: 0, border: 0, cursor: 'zoom-in', display: 'block', background: 'transparent' }}>
      <div style={{ aspectRatio: cols === 1 ? '16/9' : undefined, overflow: 'hidden', borderRadius: 10, border: '1px solid #E7E5E0', background: '#E7E5E0' }}>
        {cols === 1
          ? <div className="gallery-img" style={{ width: '100%', height: '100%', backgroundImage: `url("${src}")`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
          : <img className="gallery-img" src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />}
      </div>
    </button>
  )
}

interface Props {
  work: Work
  onLightbox: (src: string) => void
}

// 작업물 상세 — 데스크톱: 좌 이미지(2) / 우 텍스트(1) 2단, 각 열 독립 스크롤 (globals.css .work-split)
// 모바일: 한 줄로 쌓기 — 히어로 → 텍스트 → 갤러리 순서
export default function WorkDetail({ work, onLightbox }: Props) {
  const blocks = work.description.map((block: any) => // eslint-disable-line @typescript-eslint/no-explicit-any
    typeof block === 'string' ? { type: 'text' as const, content: block } : block)
  const textBlocks = blocks.filter((b: any) => b.type !== 'image') // eslint-disable-line @typescript-eslint/no-explicit-any
  const imageBlocks = blocks.filter((b: any) => b.type === 'image') // eslint-disable-line @typescript-eslint/no-explicit-any
  const cols = work.gallery_cols ?? 1
  // 하단 배지: 툴 먼저, 이어서 태그 (툴은 '·' 또는 ',' / 태그는 ',' 로 구분)
  const split = (s: string | undefined, sep: RegExp) => (s ?? '').split(sep).map(t => t.trim()).filter(Boolean)
  const tools = split(work.tools, /[·,]/)
  const tags = split(work.tag, /,/)

  return (
    <div className="work-split">
      {/* 좌: 이미지 영역 (스크롤) */}
      <div className="work-media">
        <div className="work-hero" style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 12, border: `1px solid ${T.hairline}`, background: T.imgWell }}>
          <div style={{ width: '100%', height: '100%', backgroundImage: `url("${work.img}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>

        <div className="work-gallery-wrap">
          {imageBlocks.map((block: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <img key={i} src={block.url} alt={block.alt || ''} style={{ width: '100%', borderRadius: 10, display: 'block', marginTop: 14 }} />
          ))}

          {work.gallery.length > 0 && <>
            <div style={{ fontFamily: "'Geist',ui-monospace,monospace", fontSize: 12, textTransform: 'uppercase', color: T.textGhost, margin: '28px 0 12px' }}>Gallery — tap to enlarge</div>
            {/* 단 수는 작업물마다 어드민에서 선택 (globals.css .work-gallery — 모바일 최대 2단) */}
            <div className="work-gallery" data-cols={cols} style={{ display: 'grid', gap: 14, alignItems: 'start' }}>
              {work.gallery.map((src, i) => <GalleryItem key={i} src={src} cols={cols} onClick={() => onLightbox(src)} />)}
            </div>
          </>}
        </div>
      </div>

      {/* 우: 텍스트 영역 (고정, 길어지면 자체 스크롤)
          안쪽 박스 최소 높이 = 열 전체 높이 → 배지가 시트 하단 패딩 바로 위에 고정, 본문이 길면 본문 아래 40px */}
      <div className="work-info">
        <div className="work-info-inner" style={{ display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,2.6vw,38px)', lineHeight: 1.1, letterSpacing: '-.03em', margin: 0, color: T.heading }}>{work.title}</h2>
        <div style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontSize: 13, fontWeight: 500, color: T.textMuted, marginTop: 10, marginBottom: 26 }}>{work.role} · {work.year}{work.field ? ` · ${work.field}` : ''}{work.private ? ' · 비공개' : ''}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {textBlocks.map((block: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <p key={i} style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 16, lineHeight: 1.8, color: T.textBody, margin: 0 }}>{block.content}</p>
          ))}
        </div>

        {/* 툴 · 태그 — 원형 배지 (높이는 Index 필터 탭과 동일: 12px + 위아래 패딩 6px)
            툴: Fill (잉크 배경 + 크림 글자, Index 선택 탭과 같은 반전) / 태그: 라인 (글자 70% · 테두리 50%) */}
        {(tools.length > 0 || tags.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 6, marginTop: 'auto', paddingTop: 40 }}>
            {tools.map((t, i) => (
              <span key={`tool-${i}`} style={{ ...badge, color: '#FDFBF7', background: '#231F1A', border: '1px solid #231F1A' }}>{t}</span>
            ))}
            {tags.map((t, i) => (
              <span key={`tag-${i}`} style={{
                ...badge, color: T.text, opacity: .7, border: '1px solid color-mix(in srgb, currentColor 71%, transparent)',
                // 착시 보정: Fill(툴) 바로 옆 첫 태그는 연한 테두리가 어두운 면에 묻혀 간격이 좁아 보여 1px 추가 (총 3px)
                marginLeft: i === 0 && tools.length > 0 ? 1 : 0,
              }}>{t}</span>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
