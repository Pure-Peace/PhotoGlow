'use client'

import { ProfileData } from '@photoglow/shared/types/profile'
import { UserSection } from './user-section'
import { ProfileTabs } from './profile-tabs'
import type { UserWithAccessToken } from '@photoglow/shared/types/user'

type ProfileMainProps = {
  profileData: ProfileData
  authData: UserWithAccessToken | null
}

export function ProfileMain({ profileData, authData }: ProfileMainProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      {/* Profile header */}
      <UserSection ssrUserId={authData?.user?.id} profileData={profileData} />

      {/* tabs */}
      <ProfileTabs username={profileData.user.username} />
    </div>
  )
}
