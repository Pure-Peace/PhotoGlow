'use client'

import type { UserWithAccessToken } from '@photoglow/shared/types/user'
import { createContext, useContext } from 'react'

const SSRAuthContext = createContext<UserWithAccessToken | null>(null)

export const useSSRAuth = () => {
  const context = useContext(SSRAuthContext)
  if (context === undefined) {
    throw new Error('useSSRAuth must be used within a SSRAuthProvider')
  }
  return context
}

// ssr only
export function SSRAuthProvider({
  children,
  ssrAuth,
}: {
  children: React.ReactNode
  ssrAuth: UserWithAccessToken | null
}) {
  return (
    <SSRAuthContext.Provider value={ssrAuth}>
      {children}
    </SSRAuthContext.Provider>
  )
}
