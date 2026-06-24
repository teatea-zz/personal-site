'use client'

interface Props {
  src: string | null
  onClose: () => void
}

export default function Lightbox({ src, onClose }: Props) {
  if (!src) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px,4vw,64px)',
        background: 'rgba(8,8,8,.94)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="hover-accent"
        style={{
          position: 'absolute',
          top: 'clamp(14px,3vw,28px)',
          right: 'clamp(14px,3vw,28px)',
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,.3)',
          background: 'rgba(20,20,20,.6)',
          color: '#f4f4f1',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          transition: '.16s',
        }}
      >✕</button>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url("${src}")`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
        }}
      />
    </div>
  )
}
