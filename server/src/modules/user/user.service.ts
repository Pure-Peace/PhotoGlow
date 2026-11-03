import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'

import { UpdateUserDto } from '@/modules/user/dto/user.dto'

import type { SanitizedUser } from '@photoglow/shared/types/user'
import { sanitizeUser } from '@/common/utils/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3Service } from '@/infra/s3/s3.service'
import { UserStatus } from '@photoglow/database'
import { CookieService } from '@/infra/cookie/cookie.service'
import { TokenService } from '@/infra/token/token.service'
import { generateUsername } from 'unique-username-generator'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service,
    private cookieService: CookieService,
    private tokenService: TokenService
  ) {}

  async getUserByUsername(username: string, userId?: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { username, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Get follower count
    const followersCount = await this.prisma.follow.count({
      where: { followingId: user.id },
    })

    // Get following count
    const followingCount = await this.prisma.follow.count({
      where: { followerId: user.id },
    })

    // Get posts count
    const postsCount = await this.prisma.post.count({
      where: { authorId: user.id },
    })

    const userData = sanitizeUser(user)

    // Initialize relationship status
    let relationship = {
      isFollowing: false,
      isFollowedBy: false,
      isBlocked: false,
    }

    // If userId is provided, check relationship status
    if (userId && userId !== user.id) {
      // Check if authenticated user is following the profile user
      const following = await this.prisma.follow.findFirst({
        where: {
          followerId: userId,
          followingId: user.id,
        },
      })
      relationship.isFollowing = !!following

      // Check if profile user is following the authenticated user
      const followedBy = await this.prisma.follow.findFirst({
        where: {
          followerId: user.id,
          followingId: userId,
        },
      })
      relationship.isFollowedBy = !!followedBy

      // Check if authenticated user has blocked the profile user
      const blocked = await this.prisma.block.findFirst({
        where: {
          blockerId: userId,
          blockedId: user.id,
        },
      })
      relationship.isBlocked = !!blocked
    }

    return {
      user: {
        ...userData,
        relationship,
      },
      stats: {
        followers: followersCount,
        following: followingCount,
        posts: postsCount,
      },
    }
  }

  async updateUserProfile(
    userId: string,
    updateProfileDto: UpdateUserDto,
    avatar?: Express.Multer.File
  ): Promise<SanitizedUser> {
    const { username, displayName, bio } = updateProfileDto

    // Check if username is already taken
    if (username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          username,
          id: { not: userId },
        },
      })

      if (existingUser) {
        throw new ConflictException('Username already in use')
      }
    }

    const updateData: any = {}

    if (username) updateData.username = username
    if (displayName) updateData.displayName = displayName
    if (bio !== undefined) updateData.bio = bio

    // Upload avatar if provided
    if (avatar) {
      const uploadResult = await this.s3Service.uploadFile(avatar, 'avatars')
      updateData.avatar = uploadResult.url
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return sanitizeUser(updatedUser)
  }

  async deleteUser(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      const username = generateUsername('_', 3, 20, 'deleteduser')

      await tx.user.update({
        where: { id: userId },
        data: {
          avatar: null,
          email: `${username}_deleted`,
          displayName: username,
          username: username,
          status: UserStatus.DELETED,
          bio: null,
          phoneNumber: null,
          phoneVerified: null,
          twoFactorEnabled: false,
          followersCount: 0,
          followingCount: 0,
        },
      })
      await this.tokenService.deleteAllRefreshTokens(userId, tx)
      await this.prisma.oAuthAccount.deleteMany({
        where: { userId },
      })
    })

    this.cookieService.clearRefreshToken()

    return { success: true }
  }
}
