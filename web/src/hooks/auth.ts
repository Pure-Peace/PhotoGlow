import { useAuthStore } from '@/stores/auth'
import { useHydrated } from './hydrate'
import { useSSRAuth } from '@/app/context/ssr-auth-context'

export function useLoggedIn() {
  const ssrLoggedIn = !!useSSRAuth()

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const isHydrated = useHydrated()

  // using ssr state if not hydrated
  if (!isHydrated) {
    return ssrLoggedIn ?? false
  }

  return isLoggedIn
}
