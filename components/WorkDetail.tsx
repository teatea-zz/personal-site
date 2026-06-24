'use client'

import type { Work } from '@/types/database'

const IMG_FILTER = 'grayscale(.15) sepia(.18) saturate(.82) contrast(1.05) brightness(.9)'

interface Props {
  work: Work
  onBack: () => void
  onLightbox: (src: string) => void
}

export default function WorkDetail({ work, onBack, onLightbox }: Props) {
  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <button
        onClick={onBack}
        className="hover-accent"
        style={{
          border: '1px solid rgba(255,255,255,.22)',
          color: '#f4f4f1',
          fontFamily: "'IBM Plex Mono',ui-monospace,monospace",
          fontSize: 11,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          padding: '8px 16px',
          borderRadius: 8,
          cursor: 'pointer',
          transition: '.16s',
          marginBottom: 22,
        }}
      >← Work</button>

      <div style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 12, border: '1px solid rgba(255,255,255,.1)', background: '#1a1a1a' }}>
        <div style={{ width: '100%', height: '100%', backgroundImage: `url("${work.img}")`, backgroundSize: 'cover', backgroundPosition: 'center', filter: IMG_FILTER }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, marginTop: 22 }}>
        <h2 style={{ fontFamily: "'SUIT Variable',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4.4vw,46px)', lineHeight: 1.04, letterSpacing: '-.03em', margin: 0, color: '#f6f6f3' }}>{work.title}</h2>
        <span style={{ fontFamily: "'SUIT Variable',-apple-system,sans-serif", fontSize: 12, fontWeight: 500, color: 'rgba(244,244,241,.5)' }}>{work.role} · {work.year} · {work.tag}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 1, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, overflow: 'hidden', margin: '26px 0' }}>
        {[
          { label: 'Year', val: work.year },
          { label: 'Role', val: work.role },
          { label: 'Field', val: work.field },
          { label: 'Tools', val: work.tools },
        ].map(({ label, val }) => (
          <div key={label} style={{ background: '#101010', padding: '14px 16px' }}>
            <div style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(244,244,241,.4)' }}>{label}</div>
            <div style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 14, fontWeight: 500, marginTop: 5, color: '#eee' }}>{val}</div>
          </div>
        ))}
      </div>

      {work.description.map((p, i) => (
        <p key={i} style={{ fontFamily: "'SUIT Variable',sans-serif", fontSize: 15, lineHeight: 1.8, color: 'rgba(244,244,241,.82)', margin: '0 0 18px', maxWidth: '64ch' }}>{p}</p>
      ))}

      <div style={{ fontFamily: "'IBM Plex Mono',ui-monospace,monospace", fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(244,244,241,.4)', margin: '28px 0 12px' }}>Gallery — tap to enlarge</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 14 }}>
        {work.gallery.map((src, i) => (
          <button key={i} onClick={() => onLightbox(src)} style={{ width: '100%', padding: 0, border: 0, cursor: 'zoom-in', display: 'block', background: 'transparent' }}>
            <div style={{ aspectRatio: '4/3', overflow: 'hidden', borderRadius: 10, border: '1px solid rgba(255,255,255,.1)', background: '#1a1a1a' }}>
              <div className="gallery-img" style={{ width: '100%', height: '100%', backgroundImage: `url("${src}")`, backgroundSize: 'cover', backgroundPosition: 'center', filter: IMG_FILTER }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
