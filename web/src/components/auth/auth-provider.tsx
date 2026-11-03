'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useSSRAuth } from '@/app/context/ssr-auth-context'

/**
 * sync auth data from server to client, the data is stored in the browser's memory
 */
export const AuthProvider = () => {
  const ssrAuth = useSSRAuth()
  const { setAccessToken, setUser, clearAuth, setIsReady } = useAuthStore()

  useEffect(() => {
    if (ssrAuth) {
      setAccessToken(ssrAuth.accessToken)
      setUser(ssrAuth.user)
    } else {
      clearAuth()
    }

    setIsReady(true)
  }, [ssrAuth])

  return null
}
