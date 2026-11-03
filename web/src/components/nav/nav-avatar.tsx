'use client'

import { UserIcon } from 'lucide-react'
import { UserAvatar } from '../ui/user-avatar'

export type NavAvatarProps = {
  username: string | null
  avatar: string | null
}

export function NavAvatar({ username, avatar }: NavAvatarProps) {
  if (!username || !avatar) return <UserIcon />

  return <UserAvatar name={username} avatar={avatar} className="h-6 w-6" />
}
