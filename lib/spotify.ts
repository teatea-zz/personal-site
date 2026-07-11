// Spotify Web API — 리프레시 토큰으로 액세스 토큰 발급
// 필요한 env: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN

const TOKEN_URL = 'https://accounts.spotify.com/api/token'

export async function getAccessToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID
  const secret = process.env.SPOTIFY_CLIENT_SECRET
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN
  if (!id || !secret || !refresh) return null

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh }),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  return json.access_token ?? null
}

export interface LastPlayed {
  id: string
  title: string
  artist: string
  url: string
}

export async function getLastPlayed(): Promise<LastPlayed | null> {
  const token = await getAccessToken()
  if (!token) return null

  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  const track = json.items?.[0]?.track
  if (!track) return null

  return {
    id: track.id,
    title: track.name,
    artist: (track.artists ?? []).map((a: { name: string }) => a.name).join(', '),
    url: track.external_urls?.spotify ?? '',
  }
}
