import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/auth'

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard']
// Routes only managers can access
const MANAGER_ONLY = ['/dashboard/analytics', '/dashboard/revenue', '/dashboard/products/delete']
// Routes accessible to both roles  
// const BOTH_ROLES = ['/dashboard', '/chat']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Parse session from cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value
  let session: { role: string; storeId: string | null } | null = null

  if (sessionCookie) {
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie))
    } catch {
      session = null
    }
  }

  const isAuthenticated = !!session

  // 1. Authenticated users visiting landing page → redirect to dashboard
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Unauthenticated users visiting protected routes → redirect to login
  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Worker trying to access manager-only routes → redirect to dashboard
  if (isAuthenticated && session?.role === 'WORKER') {
    if (MANAGER_ONLY.some((p) => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 4. Authenticated users visiting /login → redirect to dashboard
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
