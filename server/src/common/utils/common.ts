import type { User } from '@photoglow/database'

import type { SanitizedUser, UserStatus } from '@photoglow/shared/types/user'

export const sanitizeUser = (user: User): SanitizedUser => {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    bio: user.bio,
    email: user.email ?? undefined,
    status: user.status as UserStatus,
    emailVerified: user.emailVerified ?? undefined,
    phoneNumber: user.phoneNumber ?? undefined,
    phoneVerified: user.phoneVerified ?? undefined,
    twoFactorEnabled: user.twoFactorEnabled,
    lastActiveAt: user.lastActiveAt,
    followersCount: user.followersCount,
    followingCount: user.followingCount,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
