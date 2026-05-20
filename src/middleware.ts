
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Executive Middleware Protocol.
 * Enforces role-based access control and prevents auth loops.
 * Roles: super_admin, company_admin, staff, viewer, driver, customer
 */
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const role = request.cookies.get('user-role')?.value
  const uid = request.cookies.get('user-uid')?.value

  const isLoggedIn = !!uid
  const isAdminRole = ['super_admin', 'company_admin', 'staff', 'viewer'].includes(role || '')

  // 1. Protect SUPER ADMIN routes (Strictly super_admin)
  if (path.startsWith('/super-admin')) {
    if (!isLoggedIn || role !== 'super_admin') {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  // 2. Protect ADMIN routes (All administrative roles)
  if (path.startsWith('/admin')) {
    if (!isLoggedIn || !isAdminRole) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  // 3. Protect CUSTOMER dashboard
  if (path.startsWith('/dashboard')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
  }

  // 4. Redirect logged-in users away from auth page
  if (path === '/auth' && isLoggedIn) {
    if (role === 'super_admin') return NextResponse.redirect(new URL('/super-admin', request.url))
    if (isAdminRole) return NextResponse.redirect(new URL('/admin', request.url))
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth',
  ],
}
