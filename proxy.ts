// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const PROTECTED_PREFIXES = ['/calendar', '/faculty'] as const
const PROTECTED_MATCHERS = ['/calendar/:path*', '/faculty/:path*'] as const

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()
  const p = req.nextUrl.pathname;
  res.headers.set("x-pathname", p);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = req.nextUrl.pathname
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  // Redirect authenticated users from landing page to calendar
  if (pathname === "/" && user) {
    const calendarUrl = new URL("/calendar", req.url)
    return NextResponse.redirect(calendarUrl)
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtected && !user) {
    const loginUrl = new URL("/login", req.url)
    // Preserve full path + search (e.g., /calendar/02-25-06?foo=bar)
    loginUrl.searchParams.set("next", req.nextUrl.pathname + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  return res
}

export const config = {
  matcher: ['/', '/calendar/:path*', '/faculty/:path*'],
}
