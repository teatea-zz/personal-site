import { NextResponse } from 'next/server'
import { getLastPlayed } from '@/lib/spotify'

// 60초 캐시 — 방문마다 Spotify API를 때리지 않도록
export const revalidate = 60

export async function GET() {
  const track = await getLastPlayed()
  return NextResponse.json(track ?? { id: null }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}
