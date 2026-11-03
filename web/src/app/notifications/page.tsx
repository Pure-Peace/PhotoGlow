import { ssrAuth } from '@/lib/auth'
import { api } from '@/api'
import { NotificationsPage } from '@/components/notifications/notifications-page'

export async function generateMetadata() {
  return {
    title: 'Notifications | PhotoGlow',
    description: 'View your notifications on PhotoGlow',
  }
}

export default async function NotificationsPageWithData() {
  const authData = await ssrAuth()
  const initialNotifications = authData
    ? await api.getNotifications(authData.accessToken, { limit: 10 })
    : null

  return (
    <NotificationsPage
      initialNotifications={initialNotifications?.notifications ?? null}
    />
  )
}
