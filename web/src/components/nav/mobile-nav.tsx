'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { UnreadBadge } from '../notifications/unread-badge'
import { useAuthStore } from '@/stores/auth'
import { Bell, Compass, Home, LucideIcon, Plus, UserCircle } from 'lucide-react'
import { useNotificationsStore } from '@/stores/notifications'
import { RequireAuth } from '../common/require-auth'
import { useState, useEffect } from 'react'

export type MobileNavItemProps = {
  isActive: boolean
  icon: LucideIcon
  href: string
  label: string
  children?: React.ReactNode
  onClick?: () => void
}

export function MobileNavItem({
  isActive,
  icon,
  href,
  label,
  children,
  onClick,
}: MobileNavItemProps) {
  const Icon = icon

  return (
    <Link
      key={href}
      href={href}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1 px-2',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div className="relative">
        <Icon className="size-5" />
        {children}
      </div>
      <span className="text-xs">{label}</span>
    </Link>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const { unreadCount } = useNotificationsStore()

  return (
    <nav className="bg-background/80 supports-[backdrop-filter]:bg-background/50 fixed right-0 bottom-0 left-0 z-50 flex h-14 items-center justify-around border-t backdrop-blur-md md:hidden">
      <MobileNavItem
        isActive={pathname === '/'}
        icon={Home}
        href="/"
        label="Home"
      />

      <MobileNavItem
        isActive={pathname === '/explore'}
        icon={Compass}
        href="/explore"
        label="Explore"
      />

      <Link
        href="/upload"
        className="bg-primary text-primary-foreground hover:bg-primary/90 -mt-1 flex size-10 flex-col items-center justify-center rounded-xl px-6 shadow-lg transition-colors"
      >
        <Plus className="size-6" />
      </Link>

      <MobileNavItem
        isActive={pathname === '/notifications'}
        icon={Bell}
        href="/notifications"
        label="Messages"
      >
        <UnreadBadge
          count={unreadCount}
          className="absolute -top-0.5 -right-2"
        />
      </MobileNavItem>

      <MobileNavProfile />
    </nav>
  )
}

export function MobileNavProfile() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { push, refresh } = useRouter()
  const [pendingNavigation, setPendingNavigation] = useState(false)

  const href = user ? `/@${user.username}` : '#'

  useEffect(() => {
    if (pendingNavigation && user?.username) {
      push(`/@${user.username}`)
      refresh()
      setPendingNavigation(false)
    }
  }, [user?.username, pendingNavigation, push, refresh])

  const callback = user
    ? undefined
    : () => {
        setPendingNavigation(true)
      }

  return (
    <RequireAuth>
      <MobileNavItem
        isActive={pathname.startsWith('/@')}
        icon={UserCircle}
        href={href}
        label="Profile"
        onClick={callback}
      />
    </RequireAuth>
  )
}
