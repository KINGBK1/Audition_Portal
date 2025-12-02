import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lines 62-81


export function middleware(request: NextRequest) {
    // Check for auth token (adjust based on your auth method)
    const token = request.cookies.get('token')?.value

    const isAuthPage = request.nextUrl.pathname === '/'
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/exam') ||
        request.nextUrl.pathname.startsWith('/profile') ||
        request.nextUrl.pathname.startsWith('/round-info')

    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // Redirect to home if accessing protected route without token
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    // Add admin role check here if needed
    //   In admin also scheck that the user has admin role
    const fetchUserRole = async () => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user`,
            {
                method: "GET",
                credentials: "include"
            })
        const user = await res.json()

        if (user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

    } catch (e) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }
}
    if (isAdminRoute && token) {
        return fetchUserRole()
    }

    // Redirect to dashboard if accessing auth page with token
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }


    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/exam/:path*', '/profile/:path*', '/round-info/:path*', '/admin/:path*']
}