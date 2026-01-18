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
      // Check if token is in URL (from OAuth redirect)
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get('token')
      
      if (tokenFromUrl) {
        // Store token in cookie
        document.cookie = `token=${tokenFromUrl}; Path=/; SameSite=None; Secure; Max-Age=86400`
        
        // Clean URL
        const cleanUrl = window.location.pathname
        window.history.replaceState({}, '', cleanUrl)
      }
      
      try {
        await dispatch(verifyToken()).unwrap()
        setIsVerifying(false)
      } catch (error) {
        console.error('Auth failed:', error)
        setIsVerifying(false)
        
        // Only redirect to login if trying to access protected route
        if (!isPublicRoute) {
          router.push('/')
        }
      }
    }

    checkAuth()
  }, [dispatch, pathname])

  // Handle redirects based on auth state
  useEffect(() => {
    if (isVerifying) return

    // If authenticated and on public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      if (userInfo?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      return
    }

    // If not authenticated and on protected route, redirect to login
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/')
      return
    }

    // Handle admin route protection
    if (isAuthenticated && pathname.startsWith('/admin') && userInfo?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Handle regular user trying to access admin dashboard
    if (isAuthenticated && pathname.startsWith('/dashboard') && userInfo?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
  }, [isAuthenticated, isPublicRoute, isVerifying, pathname, userInfo, router])

  // Show loading state while verifying - keep your existing loader design
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}