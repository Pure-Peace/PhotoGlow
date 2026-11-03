import { buildUrl, authorizationHeader, respError } from '@/lib/utils'
import { Notification } from '@photoglow/shared/types/notifications'

// Get notifications for the user
async function getNotifications(
  accessToken: string,
  options: {
    limit?: number
    offset?: number
  } = {}
): Promise<{ notifications: Notification[]; unreadChatCount: number }> {
  const queryParams = new URLSearchParams()
  if (options.limit) queryParams.set('limit', options.limit.toString())
  if (options.offset) queryParams.set('offset', options.offset.toString())

  const res = await fetch(buildUrl(`notifications?${queryParams}`), {
    headers: {
      ...authorizationHeader(accessToken),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

async function getUnreadNotificationAndChatCount(
  accessToken: string
): Promise<{ unreadNotificationCount: number; unreadChatCount: number }> {
  const res = await fetch(buildUrl('notifications/count'), {
    headers: {
      ...authorizationHeader(accessToken),
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!res.ok) {
    throw await respError(res)
  }

  return res.json()
}

// Mark notifications as read
async function markNotificationsAsRead(
  accessToken: string,
  notificationIds: string[]
): Promise<boolean> {
  const res = await fetch(buildUrl('notifications/read'), {
    method: 'POST',
    body: JSON.stringify({ notificationIds }),
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

async function deleteNotification(accessToken: string, notificationId: string) {
  const res = await fetch(buildUrl(`notifications/${notificationId}`), {
    method: 'DELETE',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...authorizationHeader(accessToken),
    },
  })

  if (!res.ok) {
    throw await respError(res)
  }

  const { success } = await res.json()
  return success
}

export {
  getNotifications,
  getUnreadNotificationAndChatCount,
  markNotificationsAsRead,
  deleteNotification,
}
