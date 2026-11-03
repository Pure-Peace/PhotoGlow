'use client'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { UserAvatar } from '@/components/ui/user-avatar'
import { Button } from '@/components/ui/button'
import { Check, LogIn, Trash2, Bell, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Notification } from '@photoglow/shared/types/notifications'
import { useSSRAuth } from '@/app/context/ssr-auth-context'
import { AuthButton } from '@/components/auth/auth-button'
import { formatTime } from '@/lib/date'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Linkify } from '../linkify/linkify'
import { useNotificationsStore } from '@/stores/notifications'

interface NotificationsPageProps {
  initialNotifications: Notification[] | null
}

export function NotificationsPage({
  initialNotifications,
}: NotificationsPageProps) {
  const ssrAuth = useSSRAuth()
  const { accessToken, user } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[] | null>(
    initialNotifications
  )

  const [noMoreNotifications, setNoMoreNotifications] = useState(false)
  const [offset, setOffset] = useState(initialNotifications?.length ?? 0)
  const [isLoading, setIsLoading] = useState(!initialNotifications)
  const { decrementUnreadCount, subUnreadCount } = useNotificationsStore()

  const fetchNotifications = async () => {
    if (!accessToken) return

    setIsLoading(true)
    try {
      const { notifications } = await api.getNotifications(accessToken, {
        limit: 10,
        offset,
      })
      setNotifications((prev) => [...(prev ?? []), ...notifications])
      setOffset((prev) => prev + 10)
      setNoMoreNotifications(notifications.length === 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    if (!accessToken || !notifications) return

    try {
      await api.markNotificationsAsRead(accessToken, [notificationId])
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      decrementUnreadCount()
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!accessToken || !notifications) return

    const unreadIds = notifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id)

    if (unreadIds.length === 0) return

    try {
      await api.markNotificationsAsRead(accessToken, unreadIds)
      setNotifications(notifications.map((n) => ({ ...n, read: true })))

      subUnreadCount(unreadIds.length)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark notifications as read:', error)
      toast.error('Failed to mark notifications as read')
    }
  }

  useEffect(() => {
    if (initialNotifications) {
      setIsLoading(false)
    } else if (accessToken) {
      fetchNotifications()
    }
  }, [accessToken, initialNotifications])

  if (!ssrAuth && !user) {
    return <NotLoggedIn />
  }

  const Display =
    isLoading && notifications?.length === 0 ? (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    ) : !notifications || notifications.length === 0 ? (
      <EmptyState />
    ) : (
      <>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <NotificationCard
              key={`${notification.id}-${index}`}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              setNotifications={setNotifications}
            />
          ))}

          <div className="flex justify-center">
            {noMoreNotifications ? (
              <p className="text-muted-foreground">No more notifications</p>
            ) : (
              <Button
                disabled={isLoading}
                variant="ghost"
                className="w-full"
                size="sm"
                onClick={fetchNotifications}
              >
                {isLoading ? 'Loading...' : 'Load more'}
              </Button>
            )}
          </div>
        </div>
      </>
    )

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex gap-2">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <span className="text-muted-foreground text-sm">
            {notifications?.filter((n) => !n.read).length}
          </span>
        </div>
        {notifications?.some((n) => !n.read) && (
          <Button onClick={handleMarkAllAsRead} variant="ghost" size="sm">
            Mark all as read
          </Button>
        )}
      </div>

      {Display}
    </div>
  )
}

function NotLoggedIn() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="flex items-center justify-center">
        <Bell className="size-12" />
      </div>
      <h1 className="text-2xl font-bold">View Your Notifications</h1>
      <p className="max-w-md">
        Sign in to see notifications about your content and interactions
      </p>
      <Button asChild>
        <AuthButton size="lg">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </AuthButton>
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-muted/30 flex h-16 w-16 items-center justify-center rounded-full">
        <Bell className="size-12" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium">No notifications yet</p>
        <p className="text-muted-foreground max-w-sm">
          When someone interacts with your content or mentions you, you&apos;ll
          see notifications here
        </p>
      </div>
    </div>
  )
}

function NotificationCard({
  notification,
  onMarkAsRead,
  setNotifications,
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
  setNotifications: Dispatch<SetStateAction<Notification[] | null>>
}) {
  const { id, type, read, actor, message, createdAt, post, commentContent } =
    notification
  const { accessToken } = useAuthStore()
  const { decrementUnreadCount } = useNotificationsStore()
  const router = useRouter()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'text-rose-500'
      case 'follow':
        return 'text-blue-500'
      case 'comment':
      case 'reply':
        return 'text-green-500'
      case 'mention':
        return 'text-purple-500'
      case 'chat':
        return 'text-blue-500'
      default:
        return 'text-foreground'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'like':
        return '❤️'
      case 'follow':
        return '👤'
      case 'comment':
      case 'reply':
        return '💬'
      case 'mention':
        return '@'
      case 'chat':
        return '💌'
      default:
        return '📢'
    }
  }

  const formattedDate = formatTime(createdAt)

  const handleDelete = async () => {
    if (!accessToken) return

    try {
      await api.deleteNotification(accessToken, id)
      toast.success('Notification deleted')

      if (!read) {
        decrementUnreadCount()
      }

      // Remove the notification from the parent component's state
      setNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null)
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  return (
    <Card
      className={cn(
        'p-3 transition-colors sm:p-4',
        !read && 'bg-muted/40 border-l-primary border-l-4'
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-shrink-0">
          <Link href={`/@${actor.username}`}>
            <UserAvatar
              avatar={actor.avatar}
              name={actor.displayName}
              className="h-10 w-10 sm:h-12 sm:w-12"
            />
          </Link>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Link href={`/@${actor.username}`} className="hover:underline truncate">
                  <span className="font-medium text-sm sm:text-base">{actor.displayName}</span>
                </Link>
                <span
                  className={cn('text-[11px] sm:text-xs font-semibold', getTypeColor(type))}
                >
                  {getTypeIcon(type)} {type}
                </span>
              </div>
              <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm">{message}</p>
              {commentContent && (
                <div className="bg-muted/30 mt-1.5 sm:mt-2 rounded-md p-1.5 sm:p-2 text-xs sm:text-sm">
                  <p className="text-foreground/90 italic">
                    &ldquo;<Linkify>{commentContent}</Linkify>&rdquo;
                  </p>
                </div>
              )}
            </div>
            <span
              className="text-muted-foreground text-[10px] sm:text-xs whitespace-nowrap"
              suppressHydrationWarning
            >
              {formattedDate}
            </span>
          </div>

          {post && (
            <Link
              href={`/@${actor.username}/photo/${post.id}`}
              className="mt-4 sm:mt-6 block"
            >
              <div className="bg-muted/30 hover:bg-muted flex items-center gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 transition-colors">
                {post.cover && (
                  <Image
                    src={post.cover}
                    alt={post.title}
                    height={256}
                    width={256}
                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-md object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-1 font-medium text-sm sm:text-base">{post.title}</p>
                  {post.preview && (
                    <p className="text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 text-xs sm:text-sm">
                      {post.preview}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          )}

          <div className="mt-2 sm:mt-3 flex justify-end gap-1.5 sm:gap-2">
            {type === 'chat' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 text-[11px] sm:text-xs px-2 sm:px-3"
                onClick={() => router.push(`/chat?userId=${actor.id}`)}
              >
                <MessageSquare className="mr-1 h-3 w-3" />
                Chat
              </Button>
            )}
            {!read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 text-[11px] sm:text-xs px-2 sm:px-3"
                onClick={() => onMarkAsRead(id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-destructive h-7 sm:h-8 text-[11px] sm:text-xs px-2 sm:px-3"
              onClick={handleDelete}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
