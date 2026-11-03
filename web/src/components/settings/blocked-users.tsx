'use client'

import { useEffect, useState } from 'react'
import { UserAvatar } from '../ui/user-avatar'
import { api } from '@/api'
import { Button } from '../ui/button'
import { Loader2, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type BlockedUser = {
  id: string
  username: string
  displayName: string
  avatar: string
}

type BlockedUsersListProps = {
  className?: string
}

export function BlockedUsersList({ className }: BlockedUsersListProps) {
  const [users, setUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuthStore()
  const [unblockingUserId, setUnblockingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    async function fetchBlockedUsers() {
      try {
        if (!accessToken) {
          throw new Error('No access token')
        }

        setLoading(true)
        setError(null)
        const data = await api.getBlockedUsers(accessToken)
        setUsers(data)
      } catch (err) {
        setError('Failed to load blocked users')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlockedUsers()
  }, [accessToken])

  const handleUnblock = async (userId: string) => {
    if (!accessToken) {
      toast.error('You need to be logged in')
      return
    }

    setUnblockingUserId(userId)
    try {
      await api.unblockUser(accessToken, userId)

      // Remove the user from the list
      setUsers(users.filter((user) => user.id !== userId))
      toast.success('User unblocked successfully')
    } catch (error) {
      console.error('Failed to unblock user:', error)
      toast.error('Failed to unblock user')
    } finally {
      setUnblockingUserId(null)
    }
  }

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
            if (!accessToken) return

            setLoading(true)
            setError(null)
            // Retry loading
            api
              .getBlockedUsers(accessToken)
              .then(setUsers)
              .catch((err) => {
                setError('Failed to load blocked users')
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
      <p className="text-muted-foreground pt-8 text-center text-sm">
        You haven&apos;t blocked any users
      </p>
    )
  }

  return (
    <div className={cn('divide-y', className)}>
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between gap-3 py-3"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user.displayName}
              avatar={user.avatar}
              className="h-10 w-10"
            />
            <div className="flex flex-col">
              <span className="font-medium">{user.displayName}</span>
              <span className="text-muted-foreground text-sm">
                @{user.username}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={unblockingUserId === user.id}
            onClick={() => handleUnblock(user.id)}
          >
            {unblockingUserId === user.id ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <UserCheck className="mr-1 h-3 w-3" />
            )}
            Unblock
          </Button>
        </div>
      ))}
    </div>
  )
}
