import type { Metadata } from 'next'
import { ssrAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SettingsMain } from '@/components/settings/settings-main'

export const metadata: Metadata = {
  title: 'Account Settings | PhotoGlow',
  description: 'Account & Settings for PhotoGlow',
}

export default async function SettingsPage() {
  const authData = await ssrAuth()

  // if not logged in, redirect to home page
  if (!authData) {
    return redirect('/')
  }

  return <SettingsMain />
}
