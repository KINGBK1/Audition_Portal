// frontend/middleware.ts
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
  const path = request.nextUrl.pathname

  console.log('Middleware executed for path:', path)

  const isAuthPage = path === '/'
  const isAdminRoute = path.startsWith('/admin')
  const isUserRoute = path.startsWith('/dashboard') || 
                      path.startsWith('/exam') || 
                      path.startsWith('/profile') || 
                      path.startsWith('/round-info')

  // No token - redirect all protected routes to home
  if (!token && (isAdminRoute || isUserRoute)) {
    console.log('No token, redirecting to home')
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Has token
  if (token) {
    const decoded = decodeJWT(token)
    const isAdmin = decoded?.user?.role === 'ADMIN'
    
    console.log('User role:', decoded?.user?.role, 'isAdmin:', isAdmin)

    // On auth page - redirect based on role
    if (isAuthPage) {
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Admin trying to access user routes - redirect to admin dashboard
    if (isAdmin && isUserRoute) {
      console.log('Admin accessing user route, redirecting to /admin/dashboard')
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    // Regular user trying to access admin routes - redirect to user dashboard
    if (!isAdmin && isAdminRoute) {
      console.log('Regular user accessing admin route, redirecting to /dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/exam/:path*', 
    '/profile/:path*', 
    '/round-info/:path*', 
    '/admin/:path*', 
    '/'
  ]
}