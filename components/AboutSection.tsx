'use client'

import { T } from '@/lib/theme'

export default function AboutSection() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px,3vw,44px)', maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ width: 'min(100%,300px)', flex: '0 1 300px' }}>
        <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 12, border: `1px solid ${T.hairline}`, background: T.imgWell }}>
          <img
            src="https://picsum.photos/seed/jiwoo-portrait-3/600/800"
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: 'clamp(26px,3.8vw,42px)', lineHeight: 1.18, letterSpacing: '-.025em', margin: '0 0 18px', color: T.heading }}>
          사용자의 망설임을<br />주체적인 선택으로 바꾸는 UX/UI 디자이너
        </h2>
        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: T.textBody, margin: '0 0 16px', maxWidth: '58ch' }}>
          기술이 발전할수록 좁아지는 선택지 앞에서,<br />누구나 자기만의 속도로 탐색하고 시도할 수 있는 디지털 경험을 만듭니다.
        </p>
        <p style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: T.textBody, margin: '0 0 28px', maxWidth: '58ch' }}>
          시스템과 타이포그래피, 그리고 새로움이 사라진 뒤에도 오래 읽히는 것에 마음을 씁니다. 배운 것 중 간직할 만한 것은 노트로 남깁니다.
        </p>
        <div style={{ borderTop: `1px solid ${T.hairlineStrong}` }}>
          {[
            { label: 'BASED', val: '서울, 대한민국' },
            { label: 'FOCUS', val: '디자인 시스템 · 웹 · 타입' },
            { label: 'NOW', val: '인터랙션 공부 중' },
          ].map(({ label, val }, i, arr) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.hairline}` : undefined }}>
              <span style={{ fontFamily: "'Geist',ui-monospace,monospace", color: T.textFaint, fontSize: 12 }}>{label}</span>
              <span style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 13, fontWeight: 600, color: T.textStrong }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
