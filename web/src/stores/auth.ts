'use client'

import { create } from 'zustand'
import type { User } from '@photoglow/shared/types/user'
import { devtools } from 'zustand/middleware'

export interface AuthStore {
  accessToken: string | null
  user: User | null
  isLoggedIn: boolean
  isReady: boolean
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setIsReady: (isReady: boolean) => void
}

export const useAuthStore = create(
  devtools<AuthStore>((set) => ({
    accessToken: null,
    user: null,
    isLoggedIn: false,
    isReady: false,
    bio: '',

    setAccessToken: (token) =>
      set(() => ({
        accessToken: token,
        isLoggedIn: !!token,
        isReady: true,
      })),

    setUser: (user) =>
      set(() => ({
        user,
        isReady: true,
      })),

    clearAuth: () =>
      set(() => ({
        accessToken: null,
        user: null,
        isLoggedIn: false,
      })),
    setIsReady: (isReady) =>
      set(() => ({
        isReady,
      })),
  }))
)
