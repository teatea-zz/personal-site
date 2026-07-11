'use client'

import { useEffect, useState } from 'react'

// 마지막으로 들은 곡 — Spotify 공식 임베드 (소셜바 좌측 고정)
// 트랙 정보는 /api/spotify/last-played가 제공 (env 미설정 시 아무것도 렌더하지 않음)
export default function SpotifyPlayer() {
  const [trackId, setTrackId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/spotify/last-played')
      .then(r => r.json())
      .then(d => { if (d?.id) setTrackId(d.id) })
      .catch(() => {})
  }, [])

  if (!trackId) return null

  return (
    <div style={{
      position: 'fixed',
      // 소셜바(width 50) 왼쪽에 10px 간격으로 배치
      right: 'calc(clamp(12px,2vw,28px) + 50px + 10px)',
      bottom: 'clamp(12px,2vw,28px)',
      zIndex: 20,
      width: 'min(300px, calc(100vw - 140px))',
    }}>
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="마지막으로 들은 곡"
        style={{ display: 'block', borderRadius: 12 }}
      />
    </div>
  )
}
