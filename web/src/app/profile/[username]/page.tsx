import { ssrAuth } from '@/lib/auth'
import { api } from '@/api'
import { ProfileMain } from '@/components/profile/profile-main'
import { Profile404 } from '@/components/profile/profile-404'

export async function generateMetadata({ params }: UserProfilePageProps) {
  const { username } = await params
  const authData = await ssrAuth()

  const profileData = await api.getProfileDataByUsername(
    username,
    authData?.accessToken
  )

  if (!profileData) {
    return {
      title: 'User Not Found | PhotoGlow',
      description: 'User not found on PhotoGlow',
    }
  }

  return {
    title: `${username}'s Profile | PhotoGlow`,
    description: `Check out ${username}'s photos and profile on PhotoGlow`,
  }
}

interface UserProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function UserProfile({ params }: UserProfilePageProps) {
  const { username } = await params
  const authData = await ssrAuth()

  const profileData = await api.getProfileDataByUsername(
    username,
    authData?.accessToken
  )

  if (!profileData) {
    return <Profile404 />
  }

  return <ProfileMain profileData={profileData} authData={authData} />
}
