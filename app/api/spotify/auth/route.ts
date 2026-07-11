import { NextResponse } from 'next/server'

// 리프레시 토큰 발급용 1회성 도우미 (로컬 전용)
// http://127.0.0.1:3001/api/spotify/auth 접속 → Spotify 동의 → callback이 토큰 표시
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 })
  }
  const id = process.env.SPOTIFY_CLIENT_ID
  if (!id) {
    return new NextResponse('SPOTIFY_CLIENT_ID가 .env.local에 없습니다. 먼저 추가하고 dev 서버를 재시작하세요.', { status: 500 })
  }
  const redirect = process.env.SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:3001/api/spotify/callback'

  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', id)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirect)
  url.searchParams.set('scope', 'user-read-recently-played')
  return NextResponse.redirect(url)
}
