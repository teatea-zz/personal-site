'use client'

const IMG_FILTER = 'grayscale(.15) sepia(.18) saturate(.82) contrast(1.05) brightness(.9)'

export default function AboutSection() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px,3vw,44px)', maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ width: 'min(100%,300px)', flex: '0 1 300px' }}>
        <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: '#1a1a1a' }}>
          <img
            src="https://picsum.photos/seed/jiwoo-portrait-3/600/800"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: IMG_FILTER }}
          />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: 'clamp(26px,3.8vw,42px)', lineHeight: 1.18, letterSpacing: '-.025em', margin: '0 0 18px', color: '#f6f6f3' }}>
          공개적으로 기록하는 디자이너
        </h2>
        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: 'rgba(244,244,241,.8)', margin: '0 0 16px', maxWidth: '58ch' }}>
          저는 디자이너이자 영원한 학생입니다. 이 사이트는 절반은 포트폴리오, 절반은 공개 노트예요. 완성한 작업 옆에 습작과 초고, 매일의 기록을 함께 둡니다 — 원래 그렇게 만들어지니까요.
        </p>
        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: 'rgba(244,244,241,.8)', margin: '0 0 28px', maxWidth: '58ch' }}>
          시스템과 타이포그래피, 그리고 새로움이 사라진 뒤에도 오래 읽히는 것에 마음을 씁니다. 배운 것 중 간직할 만한 것은 노트로 남깁니다.
        </p>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.12)' }}>
          {[
            { label: 'BASED', val: '서울, 대한민국' },
            { label: 'FOCUS', val: '디자인 시스템 · 웹 · 타입' },
            { label: 'NOW', val: '인터랙션 공부 중' },
          ].map(({ label, val }, i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.1)' : undefined }}>
              <span style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", color: 'rgba(244,244,241,.45)', fontSize: 10.5, letterSpacing: '.1em' }}>{label}</span>
              <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13, fontWeight: 600, color: '#eee' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
