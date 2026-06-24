import { SEED_NOTES, SEED_WORKS } from '@/lib/data'
import SiteClient from '@/components/SiteClient'

const hasSupabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url'

async function getNotes() {
  if (!hasSupabase) return SEED_NOTES
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('date', { ascending: false })
    if (error || !data?.length) return SEED_NOTES
    return data
  } catch {
    return SEED_NOTES
  }
}

async function getWorks() {
  if (!hasSupabase) return SEED_WORKS
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('works')
      .select('*')
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
