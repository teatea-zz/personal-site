'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'

const DEV_BYPASS =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(DEV_BYPASS)

  useEffect(() => {
    if (DEV_BYPASS) return
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!data.session && !pathname.includes('/login')) {
        router.replace('/admin/login')
      } else {
        setReady(true)
      }
    })
  }, [pathname, router])

  if (!ready && !pathname.includes('/login')) return null
  return <>{children}</>
}
