import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const token = req.cookies.get('sb-access-token')?.value

  // If no cookie, let the client-side layout handle the redirect
  // (avoids needing @supabase/ssr in middleware)
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
