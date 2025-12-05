import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT decoder (works in Edge runtime)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  console.log('Middleware executed for path:', request.nextUrl.pathname)

  const isAuthPage = request.nextUrl.pathname === '/'
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/exam') ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/round-info')

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

  // Redirect to home if accessing protected route without token
  if (isProtectedRoute && !token) {
    console.log('No token, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Check admin role for admin routes
  if (isAdminRoute) {
    if (!token) {
      console.log('Admin route: No token, redirecting to home')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    const decoded = decodeJWT(token)
    console.log('Decoded token:', decoded)
    
    // Check if user has ADMIN role - role is nested in user object
    if (!decoded || !decoded.user || decoded.user.role !== 'ADMIN') {
      console.log('Not an admin, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect to dashboard if accessing auth page with token
  if (isAuthPage && token) {
    const decoded = decodeJWT(token)
    // Redirect admin to admin dashboard, regular users to user dashboard
    if (decoded?.user?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/exam/:path*', '/profile/:path*', '/round-info/:path*', '/admin/:path*', '/']
}