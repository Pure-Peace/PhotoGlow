import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { UserStatus } from '@photoglow/database'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class RelationshipsService {
  private readonly logger = new Logger(RelationshipsService.name)

  constructor(private prisma: PrismaService) {}

  async followUser(
    userId: string,
    targetUserId: string,
    following: boolean
  ): Promise<boolean> {
    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId, status: UserStatus.ACTIVE },
    })

    if (!targetUser) {
      throw new NotFoundException('User not found')
    }

    // Check if user is trying to follow themselves
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself')
    }

    if (following) {
      // Create follow if it doesn't exist
      await this.prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
        update: {},
        create: {
          followerId: userId,
          followingId: targetUserId,
        },
      })

      // Create notification for target user
      await this.prisma.notification.create({
        data: {
          type: 'follow',
          actorId: userId,
          targetUserId: targetUserId,
          message: 'started following you',
        },
      })
    } else {
      // Delete follow if it exists
      await this.prisma.follow.deleteMany({
        where: {
          followerId: userId,
          followingId: targetUserId,
        },
      })
    }

    return following
  }

  async getUserFollowers(username: string, userId?: string): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: { username, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const followers = await this.prisma.follow.findMany({
      where: { followingId: user.id },
      include: {
        follower: true,
      },
    })

    const followerIds = followers.map((f) => f.follower.id)

    let followRelations: any[] = []
    let blockRelations: any[] = []

    if (userId) {
      followRelations = await this.prisma.follow.findMany({
        where: {
          OR: [
            // current user following users
            {
              followerId: userId,
              followingId: { in: followerIds },
            },
            // users following current user
            {
              followerId: { in: followerIds },
              followingId: userId,
            },
          ],
        },
      })

      // get blocked relations
      blockRelations = await this.prisma.block.findMany({
        where: {
          blockerId: userId,
          blockedId: { in: followerIds },
        },
      })
    }

    return followers.map((follow) => {
      const followerId = follow.follower.id

      // check relationship
      const relationship = {
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
      }

      if (userId && userId !== followerId) {
        // check if current user is following this follower
        relationship.isFollowing = followRelations.some(
          (rel) => rel.followerId === userId && rel.followingId === followerId
        )
        // check if this follower is following current user
        relationship.isFollowedBy = followRelations.some(
          (rel) => rel.followerId === followerId && rel.followingId === userId
        )
        // check if current user has blocked this follower
        relationship.isBlocked = blockRelations.some(
          (block) => block.blockedId === followerId
        )
      }

      return {
        id: follow.follower.id,
        username: follow.follower.username,
        displayName: follow.follower.displayName,
        avatar: follow.follower.avatar,
        relationship,
      }
    })
  }

  async getUserFollowing(username: string, userId?: string): Promise<any[]> {
    const user = await this.prisma.user.findUnique({
      where: { username, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const following = await this.prisma.follow.findMany({
      where: { followerId: user.id },
      include: {
        following: true,
      },
    })

    const followingIds = following.map((f) => f.following.id)

    let followRelations: any[] = []
    let blockRelations: any[] = []

    if (userId) {
      followRelations = await this.prisma.follow.findMany({
        where: {
          OR: [
            // current user following users
            {
              followerId: userId,
              followingId: { in: followingIds },
            },
            // users following current user
            {
              followerId: { in: followingIds },
              followingId: userId,
            },
          ],
        },
      })

      // get blocked relations
      blockRelations = await this.prisma.block.findMany({
        where: {
          blockerId: userId,
          blockedId: { in: followingIds },
        },
      })
    }

    return following.map((follow) => {
      const followingId = follow.following.id

      // check relationship
      const relationship = {
        isFollowing: false,
        isFollowedBy: false,
        isBlocked: false,
      }

      if (userId && userId !== followingId) {
        // check if current user is following this following
        relationship.isFollowing = followRelations.some(
          (rel) => rel.followerId === userId && rel.followingId === followingId
        )
        // check if this following is following current user
        relationship.isFollowedBy = followRelations.some(
          (rel) => rel.followerId === followingId && rel.followingId === userId
        )
        // check if current user has blocked this following
        relationship.isBlocked = blockRelations.some(
          (block) => block.blockedId === followingId
        )
      }

      return {
        id: follow.following.id,
        username: follow.following.username,
        displayName: follow.following.displayName,
        avatar: follow.following.avatar,
        relationship,
      }
    })
  }

  /* BLOCK APIs */

  async blockUser(userId: string, targetUserId: string): Promise<boolean> {
    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId, status: UserStatus.ACTIVE },
    })

    if (!targetUser) {
      throw new NotFoundException('User not found')
    }

    // Check if user is trying to block themselves
    if (userId === targetUserId) {
      throw new BadRequestException('You cannot block yourself')
    }

    // Create block if it doesn't exist
    await this.prisma.block.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: targetUserId,
        },
      },
      update: {},
      create: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    })

    // Automatically unfollow
    await this.prisma.follow.deleteMany({
      where: {
        OR: [
          {
            followerId: userId,
            followingId: targetUserId,
          },
          {
            followerId: targetUserId,
            followingId: userId,
          },
        ],
      },
    })

    return true
  }

  async unblockUser(userId: string, targetUserId: string): Promise<boolean> {
    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId, status: UserStatus.ACTIVE },
    })

    if (!targetUser) {
      throw new NotFoundException('User not found')
    }

    // Delete block if it exists
    await this.prisma.block.deleteMany({
      where: {
        blockerId: userId,
        blockedId: targetUserId,
      },
    })

    return true
  }

  async getBlockedUsers(userId: string): Promise<any[]> {
    const blockedUsers = await this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: true,
      },
    })

    return blockedUsers.map((block) => ({
      id: block.blocked.id,
      username: block.blocked.username,
      displayName: block.blocked.displayName,
      avatar: block.blocked.avatar,
    }))
  }
}
