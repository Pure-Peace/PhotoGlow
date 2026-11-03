import { useEffect, useState } from 'react'
import { UserAvatar } from '../ui/user-avatar'
import { api } from '@/api'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth'
import type { UserWithRelationship } from '@photoglow/shared/types/user'
import { FollowButton } from './follow-button'

export type UserListProps = {
  username: string
  type: 'followers' | 'following'
}

export function UserList({ username, type }: UserListProps) {
  const [users, setUsers] = useState<UserWithRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const accessToken = useAuthStore((state) => state.accessToken)

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        setError(null)
        const data = await (type === 'followers'
          ? api.getUserFollowers(username, accessToken ?? undefined)
          : api.getUserFollowing(username, accessToken ?? undefined))
        setUsers(data)
      } catch (err) {
        setError('Failed to load users')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [username, type])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          onClick={() => {
            setLoading(true)
            setError(null)
            // Retry loading
            api[type === 'followers' ? 'getUserFollowers' : 'getUserFollowing'](
              username
            )
              .then(setUsers)
              .catch((err) => {
                setError('Failed to load users')
                console.error(err)
              })
              .finally(() => setLoading(false))
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center">No {type} yet</p>
    )
  }

  return (
    <div className="divide-y">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between gap-3 py-3"
        >
          <Link href={`/@${user.username}`} className="flex items-center gap-3">
            <UserAvatar
              name={user.displayName ?? undefined}
              avatar={user.avatar ?? undefined}
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="font-medium">{user.displayName}</span>
              <span className="text-muted-foreground text-sm">
                @{user.username}
              </span>
            </div>
          </Link>

          <FollowButton
            size="sm"
            userId={user.id}
            withIcon
            relationship={user.relationship}
          />
        </div>
      ))}
    </div>
  )
}
