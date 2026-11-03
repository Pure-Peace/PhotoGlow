import { useEffect, useState } from 'react'

/**
 * Returns `true` if the component is hydrated.
 * If not, the component will be rendered on the server.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  return hydrated
}

export const useMounted = useHydrated

/**
 * Returns `value` only after hydration.
 * On server, or before hydration, returns `null`.
 */
export function useHydratedValue<T>(value: T): T | null {
  const hydrated = useHydrated()
  return hydrated ? value : null
}

/**
 * Returns `value` only after hydration.
 * On server, or before hydration, returns `fallback`.
 */
export function useHydratedValueFallback<T>(value: T, fallback: T): T {
  const hydrated = useHydrated()
  return hydrated ? value : fallback
}
