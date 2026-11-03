'use client'

import {
  Flag,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Settings,
  Share2,
  UserX,
} from 'lucide-react'

import { Button } from '../ui/button'
import { useAuthStore } from '@/stores/auth'
import { useHydrated } from '@/hooks/hydrate'
import { FollowButton } from './follow-button'
import Link from 'next/link'
import { shareRoute } from '@/lib/utils'
import type { User } from '@photoglow/shared/types/user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useState } from 'react'
import { api } from '@/api'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { useRouter } from 'next/navigation'
export type ProfileButtonsProps = {
  user: User
  ssrUserId?: string
  onEditProfile?: () => void
}

export function ProfileButtons({
  user,
  ssrUserId,
  onEditProfile,
}: ProfileButtonsProps) {
  const clientUserId = useAuthStore((state) => state.user?.id)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useHydrated()
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [isBlocking, setIsBlocking] = useState(false)
  const [isReporting, setIsReporting] = useState(false)

  const [following, setFollowing] = useState(
    user.relationship?.isFollowing || false
  )
  const [blocked, setBlocked] = useState(user.relationship?.isBlocked || false)

  const router = useRouter()

  const viewerUserId = isHydrated ? clientUserId : ssrUserId
  const isSelf = viewerUserId === user.id

  const handleBlock = async () => {
    if (!accessToken) {
      toast.error('Please log in to block users')
      return
    }

    setIsBlocking(true)
    try {
      if (blocked) {
        await api.unblockUser(accessToken, user.id)
      } else {
        await api.blockUser(accessToken, user.id)
      }
      toast.success(
        `${blocked ? 'Unblocked' : 'Blocked'} ${user.displayName}. ${
          blocked
            ? "You won't see their content anymore."
            : 'You will now see their content.'
        }`
      )
      setBlocked((prev) => !prev)
      setBlockDialogOpen(false)
    } catch (error) {
      console.error('Failed to block user:', error)
      toast.error('Failed to block user')
    } finally {
      setIsBlocking(false)
    }
  }

  const handleReport = async () => {
    if (!accessToken) {
      toast.error('Please log in to report users')
      return
    }

    setIsReporting(true)
    try {
      await api.reportContent(accessToken, 'user', user.id, 'Reported by user')
      toast.success('Report submitted. We will review this user.')
      setReportDialogOpen(false)
    } catch (error) {
      console.error('Failed to report user:', error)
      toast.error('Failed to report user')
    } finally {
      setIsReporting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        {isSelf ? (
          <Button
            onClick={onEditProfile}
            className="h-9 w-full rounded-full text-sm sm:h-10 sm:w-auto sm:text-base md:h-11"
            size="lg"
          >
            <Pencil className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:inline">Edit Profile</span>
          </Button>
        ) : (
          <FollowButton
            withIcon
            className="h-9 w-full sm:h-10 sm:w-auto md:h-11"
            userId={user.id}
            relationship={user.relationship}
            parentBlocked={blocked}
            parentFollowing={following}
            setParentBlocked={setBlocked}
            setParentFollowing={setFollowing}
          />
        )}

        {!isSelf && (
          <Button
            variant="outline"
            className="h-9 w-full rounded-full text-sm sm:h-10 sm:w-auto sm:text-base md:h-11"
            onClick={() => {
              if (!accessToken) {
                toast.error('Please log in to message users')
                return
              }

              router.push(`/chat?userId=${user.id}`)
            }}
          >
            <MessageCircle className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:inline">Message</span>
          </Button>
        )}

        {isSelf && (
          <Button
            asChild
            variant="ghost"
            className="aspect-square h-9 rounded-full p-0 sm:h-10 md:h-11"
          >
            <Link href="/settings">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sr-only">Settings</span>
            </Link>
          </Button>
        )}

        <Button
          variant="ghost"
          className="aspect-square h-9 rounded-full p-0 sm:h-10 md:h-11"
          onClick={() => shareRoute(`/@${user.username}`)}
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sr-only">Share</span>
        </Button>

        {accessToken && !isSelf && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="aspect-square h-9 rounded-full p-0 sm:h-10 md:h-11"
              >
                <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setReportDialogOpen(true)}>
                <Flag className="mr-2 h-4 w-4" /> Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  if (blocked) {
                    handleBlock()
                  } else {
                    setBlockDialogOpen(true)
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <UserX className="mr-2 h-4 w-4" />{' '}
                {blocked ? 'Unblock' : 'Block'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Block User Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {user.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won&apos;t be able to follow you or view your content, and
              you won&apos;t see their content. You can unblock them in your
              settings at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlocking}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              disabled={isBlocking}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isBlocking ? 'Blocking...' : 'Block User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report User Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {user.displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              We take reports seriously and will review this account. Thank you
              for helping keep our community safe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isReporting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              disabled={isReporting}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isReporting ? 'Reporting...' : 'Report User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
