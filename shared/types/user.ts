export const UserStatus = {
  active: 'ACTIVE',
  suspended: 'SUSPENDED',
  deleted: 'DELETED',
} as const

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]

export const TokenType = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const

export type TokenType = (typeof TokenType)[keyof typeof TokenType]

export type SanitizedUser = {
  id: string
  username: string
  email?: string
  displayName: string | null
  avatar: string | null
  bio: string | null
  status: UserStatus
  emailVerified?: Date
  phoneNumber?: string
  phoneVerified?: Date
  twoFactorEnabled: boolean
  lastActiveAt: Date
  followersCount: number
  followingCount: number
  createdAt: Date
  updatedAt: Date
}

export type UserRelationship = {
  isFollowing: boolean
  isFollowedBy: boolean
  isBlocked: boolean
}

export type UserWithRelationship = SanitizedUser & {
  relationship: UserRelationship
}

export interface UserWithAccessToken {
  user: User
  accessToken: string
}

export interface User {
  id: string
  username: string
  displayName?: string
  avatar?: string
  bio?: string
  email?: string
  status: UserStatus
  emailVerified?: Date
  phoneNumber?: string
  phoneVerified?: Date
  twoFactorEnabled: boolean
  lastActiveAt: string
  followersCount: number
  followingCount: number
  createdAt: string
  updatedAt: string
  relationship?: UserRelationship
}
