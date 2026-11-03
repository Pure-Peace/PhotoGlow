'use client'

import { ProfileButtons } from './profile-buttons'
import type { ProfileData } from '@photoglow/shared/types/profile'
import { useState } from 'react'
import { ProfileEditDialog } from './profile-dialog'
import { UserAvatar } from '../ui/user-avatar'
import { FollowDialog } from './follow-dialog'

type UserSectionProps = {
  profileData: ProfileData
  ssrUserId?: string
}

export function UserSection({
  profileData: data,
  ssrUserId,
}: UserSectionProps) {
  const [open, setOpen] = useState(false)
  const [followDialogOpen, setFollowDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    'followers'
  )

  const handleFollowClick = (tab: 'followers' | 'following') => {
    setActiveTab(tab)
    setFollowDialogOpen(true)
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
      <UserAvatar
        name={data.user.displayName}
        avatar={data.user.avatar}
        className="h-20 w-20 border-2 border-white shadow-md sm:h-24 sm:w-24 md:h-40 md:w-40 lg:h-56 lg:w-56"
        fallbackClassName="text-3xl font-bold"
      />

      {/* User info */}
      <div className="flex flex-col gap-2 text-center sm:gap-3 sm:text-left">
        <div className="flex flex-col items-center gap-1 sm:items-start sm:gap-2">
          <h1 className="text-xl font-bold sm:text-2xl">
            {data.user.displayName}
          </h1>
          <h2 className="text-muted-foreground text-base font-medium sm:text-lg">
            @{data.user.username}
          </h2>
        </div>

        {/* Action buttons */}
        <ProfileButtons
          onEditProfile={() => setOpen(true)}
          ssrUserId={ssrUserId}
          user={data.user}
        />

        {/* Stats */}
        <div className="mt-2 flex justify-center gap-3 sm:justify-start sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-base font-semibold sm:text-lg">
              {data.stats.posts}
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
              posts
            </span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-1 hover:underline sm:gap-2"
            onClick={() => handleFollowClick('followers')}
          >
            <span className="text-base font-semibold sm:text-lg">
              {data.stats.followers}
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
              followers
            </span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-1 hover:underline sm:gap-2"
            onClick={() => handleFollowClick('following')}
          >
            <span className="text-base font-semibold sm:text-lg">
              {data.stats.following}
            </span>
            <span className="text-muted-foreground text-sm sm:text-base">
              following
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-2 max-w-md text-sm sm:text-base">{data.user.bio}</p>
      </div>

      <ProfileEditDialog open={open} setOpen={setOpen} />
      <FollowDialog
        open={followDialogOpen}
        setOpen={setFollowDialogOpen}
        initialTab={activeTab}
        followers={data.stats.followers}
        following={data.stats.following}
        username={data.user.username}
      />
    </div>
  )
}
