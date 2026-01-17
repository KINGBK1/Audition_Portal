import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple JWT decoder (works in Edge runtime)
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT decode error:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('Middleware executed for path:', pathname)

  const token = request.cookies.get('token')?.value
  console.log('Token exists:', !!token)

  const isAuthPage = pathname === '/'
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/exam') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/round-info')

  const isAdminRoute = pathname.startsWith('/admin')

  // Allow access to auth page
  if (isAuthPage) {
    if (token) {
      const decoded = decodeJWT(token)
      console.log('Decoded token on auth page:', decoded)
      
      // Redirect authenticated users away from auth page
      if (decoded?.user?.role === 'ADMIN') {
        console.log('Admin logged in, redirecting to admin dashboard')
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      
      if (decoded?.user) {
        console.log('User logged in, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
    // No token or invalid token, allow access to auth page
    return NextResponse.next()
  }

  // Protect routes that require authentication
  if (isProtectedRoute || isAdminRoute) {
    if (!token) {
      console.log('No token found, redirecting to home')
      return NextResponse.redirect(new URL('/', request.url))
    }

    const decoded = decodeJWT(token)
    
    if (!decoded || !decoded.user) {
      console.log('Invalid token, redirecting to home')
      // Clear invalid cookie
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('token')
      return response
    }

    // Check admin routes
    if (isAdminRoute && decoded.user.role !== 'ADMIN') {
      console.log('Non-admin trying to access admin route, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check if regular user is trying to access admin route
    if (!isAdminRoute && decoded.user.role === 'ADMIN' && pathname.startsWith('/dashboard')) {
      console.log('Admin trying to access user dashboard, redirecting to admin dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    console.log('Authentication successful, allowing access')
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/exam/:path*',
    '/profile/:path*',
    '/round-info/:path*',
    '/admin/:path*'
  ]
}