'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NavItem } from './nav-item'
import { NavAvatar } from './nav-avatar'
import { useAuthStore } from '@/stores/auth'
import { useHydrated } from '@/hooks/hydrate'
import { useSSRAuth } from '@/app/context/ssr-auth-context'

interface NavProfileProps {
  collapsed?: boolean
}

export function NavProfile({ collapsed }: NavProfileProps) {
  const pathname = usePathname()

  const ssrAuth = useSSRAuth()
  const ssrUser = ssrAuth?.user
  const { user: clientUser } = useAuthStore()

  const { push, refresh } = useRouter()
  const isHydrated = useHydrated()

  const user = isHydrated ? clientUser : ssrUser
  const href = user ? `/@${user.username}` : '#'

  const [pendingNavigation, setPendingNavigation] = useState(false)

  useEffect(() => {
    if (pendingNavigation && clientUser?.username) {
      push(`/@${clientUser.username}`)
      refresh()
      setPendingNavigation(false)
    }
  }, [clientUser?.username, pendingNavigation, push, refresh])

  const callback = user
    ? undefined
    : () => {
        setPendingNavigation(true)
      }

  const username = clientUser?.username ?? ssrUser?.username ?? null
  const avatar = clientUser?.avatar ?? ssrUser?.avatar ?? null

  return (
    <NavItem
      as={Link}
      href={href}
      label={collapsed ? undefined : 'Profile'}
      isActive={() => pathname.startsWith('/@')}
      requireAuth={true}
      // When logged in, no need to manual navigate because the <Link> will work.
      // When not, <Link>'s default behavior will be prevented and open AuthDialog,
      // so this function will set to AuthDialog's next function, called when auth success.
      onClick={callback}
    >
      <NavAvatar username={username} avatar={avatar} />
    </NavItem>
  )
}
