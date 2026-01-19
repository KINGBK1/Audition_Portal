'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { verifyToken, selectAuthState } from '@/lib/store/features/auth/authSlice'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, userInfo } = useAppSelector(selectAuthState)
  const [isVerifying, setIsVerifying] = useState(true)

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    const checkAuth = async () => {
      // CRITICAL: Check URL for token from OAuth redirect
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get('token')
      
      if (tokenFromUrl) {
        // Store token in cookie with correct attributes for cross-origin
        document.cookie = `token=${tokenFromUrl}; Path=/; SameSite=None; Secure; Max-Age=86400`
        
        // Clean URL to remove token parameter
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }
      
      try {
        // Verify token with backend
        await dispatch(verifyToken()).unwrap()
        setIsVerifying(false)
      } catch (error) {
        console.error('Auth verification failed:', error)
        setIsVerifying(false)
        
        // Only redirect to home if trying to access protected route
        if (!isPublicRoute) {
          router.push('/')
        }
      }
    }

    checkAuth()
  }, [dispatch, pathname, router, isPublicRoute])

  // Handle role-based redirects
  useEffect(() => {
    if (isVerifying) return

    // Authenticated users on public routes → redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      const targetRoute = userInfo?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'
      router.push(targetRoute)
      return
    }

    // Unauthenticated users on protected routes → redirect to home
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/')
      return
    }

    // Admin route protection: Regular users can't access /admin/*
    if (isAuthenticated && pathname.startsWith('/admin') && userInfo?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Reverse protection: Admins shouldn't see regular dashboard
    if (isAuthenticated && pathname.startsWith('/dashboard') && userInfo?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
  }, [isAuthenticated, isPublicRoute, isVerifying, pathname, userInfo, router])

  // Loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">Verifying Access...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}