'use client'

import { useEffect, useState } from 'react'

export default function DebugAuthPage() {
  const [cookieInfo, setCookieInfo] = useState<any>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    // Check cookies
    const cookies = document.cookie
    console.log('All cookies:', cookies)
    
    const tokenMatch = cookies.match(/token=([^;]+)/)
    const token = tokenMatch ? tokenMatch[1] : null
    
    setCookieInfo({
      allCookies: cookies,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'No token'
    })

    // Try to verify token with backend
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/verify`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log('Verify response:', data)
          setApiResponse({ success: true, data })
        })
        .catch(err => {
          console.error('Verify error:', err)
          setApiResponse({ success: false, error: err.message })
        })
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Cookie Info:</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(cookieInfo, null, 2)}
        </pre>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold">API Verification:</h2>
        <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        <button
          onClick={() => {
            window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Try Login Again
        </button>
        
        <button
          onClick={() => {
            window.location.href = '/dashboard'
          }}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}