'use client'

import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { useEffect } from 'react'

export const NotificationProvider = () => {
  const { accessToken, isLoggedIn } = useAuthStore()
  const { setUnreadCount, setUnreadChatCount } = useNotificationsStore()

  // Fetch unread notification count and chat count
  useEffect(() => {
    if (!isLoggedIn || !accessToken) return

    const fetchUnreadCounts = async () => {
      try {
        const response =
          await api.getUnreadNotificationAndChatCount(accessToken)

        setUnreadCount(response.unreadNotificationCount)
        setUnreadChatCount(response.unreadChatCount)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchUnreadCounts()

    // Set up refresh interval
    const intervalId = setInterval(fetchUnreadCounts, 30000) // Refresh every minute

    return () => clearInterval(intervalId)
  }, [accessToken, isLoggedIn])

  return null
}
