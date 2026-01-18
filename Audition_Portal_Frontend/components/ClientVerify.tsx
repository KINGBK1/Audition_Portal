'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClientVerify() {
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
          method: 'GET',
          credentials: 'include', // critical so browser sends HttpOnly cookie stored on backend domain
          headers: { 'Content-Type': 'application/json' },
        })

        if (!mounted) return

        if (!res.ok) {
          // no valid token at backend or verification failed
          router.replace('/')
          return
        }

        const user = await res.json()
        if (user?.role === 'ADMIN') {
          router.replace('/admin/dashboard')
        } else {
          router.replace('/dashboard')
        }
      } catch (err) {
        console.error('Verify failed', err)
        router.replace('/')
      }
    }

    check()

    return () => {
      mounted = false
    }
  }, [router])

  return null
}