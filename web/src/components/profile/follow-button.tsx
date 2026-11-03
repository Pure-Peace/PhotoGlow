'use client'

import { UserPlus, Check, Ban, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Dispatch, SetStateAction, useContext, useState } from 'react'
import { PostContext } from '../post/post-main'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'
import { Label } from '../ui/label'
import type { UserRelationship } from '@photoglow/shared/types/user'

export function FollowButton({
  relationship,
  className,
  withIcon = false,
  userId,
  parentBlocked,
  parentFollowing,
  setParentBlocked,
  setParentFollowing,
  ...props
}: React.ComponentProps<typeof Button> & {
  relationship?: UserRelationship
  className?: string
  withIcon?: boolean
  userId?: string
  parentBlocked?: boolean
  parentFollowing?: boolean
  setParentBlocked?: Dispatch<SetStateAction<boolean>>
  setParentFollowing?: Dispatch<SetStateAction<boolean>>
}) {
  const [loading, setLoading] = useState(false)

  const [innerFollowing, setInnerFollowing] = useState(
    relationship?.isFollowing
  )
  const [innerBlocked, setInnerBlocked] = useState(relationship?.isBlocked)
  const [followedBy] = useState(relationship?.isFollowedBy)

  const blocked = parentBlocked === undefined ? innerBlocked : parentBlocked
  const setBlocked =
    parentBlocked === undefined
      ? setInnerBlocked
      : setParentBlocked || setInnerBlocked

  const following =
    parentFollowing === undefined ? innerFollowing : parentFollowing
  const setFollowing =
    parentFollowing === undefined
      ? setInnerFollowing
      : setParentFollowing || setInnerFollowing

  const { post } = useContext(PostContext)
  const { accessToken, user } = useAuthStore()

  const targetUserId = userId || post?.author.id

  if (targetUserId === user?.id) {
    return <Label className="text-muted-foreground">You</Label>
  }

  const handleBlock = async () => {
    if (!targetUserId) {
      toast.error('Cannot determine user to block/unblock')
      return
    }

    setLoading(true)
    try {
      if (!accessToken) {
        toast.error('Please log in first')
        return
      }

      const success = blocked
        ? await api.unblockUser(accessToken, targetUserId)
        : await api.blockUser(accessToken, targetUserId)

      if (success) {
        const newBlocked = !blocked
        setBlocked(newBlocked)
        if (newBlocked) {
          // If blocking, remove following status
          setFollowing(false)
        }
        toast.success(blocked ? 'User unblocked' : 'User blocked')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to block/unblock'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (targetUserId === user?.id) {
      toast.error('Cannot follow yourself')
      return
    }

    if (!targetUserId) {
      toast.error('Cannot determine user to follow')
      return
    }

    setLoading(true)
    try {
      if (!accessToken) {
        toast.error('Please log in to follow users')
        return
      }

      const newFollowing = await api.followUser(
        accessToken,
        targetUserId,
        !following
      )
      setFollowing(newFollowing)
      toast.success(newFollowing ? 'Following user' : 'Unfollowed user')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to follow/unfollow'
      )
    } finally {
      setLoading(false)
    }
  }

  if (blocked) {
    return (
      <Button
        className={cn('rounded-full', className)}
        variant="destructive"
        onClick={handleBlock}
        disabled={loading}
        {...props}
      >
        {withIcon && <Ban className="mr-1 h-4 w-4" />}
        Unblock
      </Button>
    )
  }

  // Determine button text and icon based on relationship status
  let buttonText = 'Follow'
  let buttonIcon = withIcon ? <UserPlus className="mr-1 h-4 w-4" /> : null
  let buttonVariant: 'default' | 'secondary' | 'outline' = 'default'
  let buttonClassName = ''

  if (following && followedBy) {
    buttonText = 'Mutual'
    buttonIcon = withIcon ? <Users className="mr-1 h-4 w-4" /> : null
    buttonVariant = 'outline'
    buttonClassName =
      'hover:bg-rose-200 text-rose-600 border-rose-200 dark:hover:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50'
  } else if (following) {
    buttonText = 'Following'
    buttonIcon = withIcon ? <Check className="mr-1 h-4 w-4" /> : null
    buttonVariant = 'secondary'
  } else if (followedBy) {
    buttonText = 'Follows You'
    buttonIcon = withIcon ? <UserPlus className="mr-1 h-4 w-4" /> : null
    buttonVariant = 'outline'
    buttonClassName =
      'hover:bg-sky-200 text-sky-600 border-sky-200 dark:hover:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/50'
  }

  return (
    <Button
      className={cn('rounded-full', className, buttonClassName)}
      variant={buttonVariant}
      onClick={handleFollow}
      disabled={loading}
      {...props}
    >
      {buttonIcon}
      {buttonText}
    </Button>
  )
}
