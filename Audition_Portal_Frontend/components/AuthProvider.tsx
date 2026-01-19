'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { verifyToken, selectAuthState, fetchUserData } from '@/lib/store/features/auth/authSlice'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, userInfo } = useAppSelector(selectAuthState)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
        const userData = await dispatch(verifyToken()).unwrap()
        console.log("✅ Auth verified - User data:", userData);
        console.log("✅ User role:", userData?.role);
        
        setIsVerifying(false)
      } catch (error) {
        console.error('❌ Auth verification failed:', error)
        setIsVerifying(false)
        
        // Only redirect to home if trying to access protected route
        if (!isPublicRoute) {
          router.push('/')
        }
      }
    }

    checkAuth()
  }, [dispatch, pathname, router, isPublicRoute])

  // CRITICAL FIX: Refresh user data when navigating to dashboard or profile
  // Wait for the refresh to complete before allowing redirects
  useEffect(() => {
    const refreshData = async () => {
      if (isAuthenticated && !isVerifying && (pathname === '/dashboard' || pathname === '/profile')) {
        console.log("🔄 Refreshing user data for:", pathname);
        setIsRefreshing(true);
        try {
          await dispatch(fetchUserData()).unwrap();
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    refreshData();
  }, [pathname, isAuthenticated, isVerifying, dispatch]);

  // Handle redirects based on auth state
  useEffect(() => {
    // Wait until both verification and refresh are complete
    if (isVerifying || isRefreshing) return

    // Helper to check profile completion
    const isProfileComplete = Boolean(
      userInfo?.contact && 
      userInfo?.gender && 
      userInfo?.specialization
    );

    console.log("📊 Profile completion status:", {
      contact: userInfo?.contact,
      gender: userInfo?.gender,
      specialization: userInfo?.specialization,
      isComplete: isProfileComplete
    });

    // Authenticated users on public routes → redirect based on profile completion
    if (isAuthenticated && isPublicRoute) {
      if (userInfo?.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        if (isProfileComplete) {
          router.push('/dashboard')
        } else {
          router.push('/profile')
        }
      }
      return
    }

    // Unauthenticated users on protected routes → redirect to home
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/')
      return
    }

    // CRITICAL FIX #1: Block exam access if already completed
    if (isAuthenticated && pathname === '/exam') {
      if (userInfo?.hasGivenExam) {
        console.log("🚫 Exam already completed - redirecting to dashboard");
        router.push('/dashboard')
        return
      }
      // Also block if profile is incomplete
      if (!isProfileComplete) {
        console.log("🚫 Profile incomplete - redirecting to profile");
        router.push('/profile')
        return
      }
    }

    // CRITICAL FIX #2: Only block dashboard if profile is incomplete
    // Don't redirect if user is on /profile page itself
    if (
      isAuthenticated && 
      pathname === '/dashboard' && 
      userInfo?.role !== 'ADMIN' &&
      !isProfileComplete
    ) {
      console.log("🚫 Profile incomplete - redirecting from dashboard to profile");
      router.push('/profile')
      return
    }

    // Admin route protection: Regular users can't access /admin/*
    if (isAuthenticated && pathname.startsWith('/admin') && userInfo?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    // Reverse protection: Admins shouldn't see regular dashboard
    if (isAuthenticated && pathname === '/dashboard' && userInfo?.role === 'ADMIN') {
      router.push('/admin/dashboard')
      return
    }
  }, [isAuthenticated, isPublicRoute, isVerifying, isRefreshing, pathname, userInfo, router])

  // Loading state while verifying or refreshing
  if (isVerifying || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm">
            {isVerifying ? 'Verifying Access...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}