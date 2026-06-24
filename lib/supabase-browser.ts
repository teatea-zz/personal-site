import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Browser client — used in client components and admin pages
export const supabaseBrowser = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
)
