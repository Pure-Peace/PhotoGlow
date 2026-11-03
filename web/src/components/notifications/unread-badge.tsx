'use client'

import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { useAuthStore } from '@/stores/auth'

export function UnreadBadge({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  const { isLoggedIn } = useAuthStore()

  if (!isLoggedIn || count === 0) return null

  return (
    <Badge
      variant="destructive"
      className={cn(
        'flex h-3 min-w-3 md:h-4 md:min-w-4 items-center justify-center rounded-full px-1 text-[9px]',
        className
      )}
    >
      {count > 9 ? '9+' : count}
    </Badge>
  )
}
