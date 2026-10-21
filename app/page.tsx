export const dynamic = 'force-dynamic'

import { SEED_NOTES, SEED_WORKS } from '@/lib/data'
import SiteClient from '@/components/SiteClient'

const hasSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

// 공개 페이지 — 비공개 노트 제외 (RLS와 이중 방어)
// 관리자 본인의 비공개 노트는 SiteClient가 브라우저 세션으로 다시 불러옴
const publicSeeds = () => SEED_NOTES.filter(n => !n.private)

async function getNotes() {
  if (!hasSupabase) return publicSeeds()
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('private', false)
      .order('date', { ascending: false })
    if (error || !data?.length) return publicSeeds()
    return data
  } catch {
    return publicSeeds()
  }
}

async function getWorks() {
  if (!hasSupabase) return SEED_WORKS
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('works')
      .select('*')
      .eq('private', false) // 비공개 작업물 제외 (RLS와 이중 방어) — 관리자는 SiteClient가 다시 불러옴
      .order('year', { ascending: false })
      .order('created_at', { ascending: false })
    if (error || !data?.length) return SEED_WORKS
    return data
  } catch {
    return SEED_WORKS
  }
}

export default async function Home() {
  const [notes, works] = await Promise.all([getNotes(), getWorks()])
  return <SiteClient notes={notes} works={works} />
}
