import { NextRequest, NextResponse } from 'next/server'

// Spotify 인증 코드 → 리프레시 토큰 교환 (로컬 전용 1회성 도우미)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return new NextResponse('code 파라미터가 없습니다', { status: 400 })

  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  if (!id || !secret) {
    return new NextResponse('SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET이 .env.local에 없습니다.', { status: 500 })
  }
  const redirect = process.env.SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:3001/api/spotify/callback'

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirect }),
  })
  const json = await res.json()

  if (!json.refresh_token) {
    return new NextResponse('토큰 교환 실패:\n' + JSON.stringify(json, null, 2), { status: 500 })
  }
  return new NextResponse(
    [
      '아래 한 줄을 .env.local에 추가한 뒤 dev 서버를 재시작하세요:',
      '',
      `SPOTIFY_REFRESH_TOKEN=${json.refresh_token}`,
      '',
      '(이 토큰은 비밀입니다 — 커밋하거나 공유하지 마세요)',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  )
}
