import { BadRequestException, Injectable } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import type { $Enums, Prisma, User } from '@photoglow/database'
import { UserStatus } from '@photoglow/database'
import type { SanitizedUser } from '@photoglow/shared/types/user'
import { sanitizeUser } from '@/common/utils/common'

// Extract all @mentions using regex
export const MENTION_USER_REGEX = /@(\w+)/g

// Extract all #topics using regex
export const MENTION_TOPIC_REGEX = /#(\w+)/g

@Injectable()
export class MentionsService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: string, userId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
        // Exclude current user if we have their ID
        ...(userId && { id: { not: userId } }),
      },
      take: 10,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
    })

    return users.map((user) => ({
      key: user.username,
      id: user.id,
      displayName: user.displayName || user.username,
      avatar: user.avatar,
    }))
  }

  async searchTopics(query: string) {
    const topics = await this.prisma.topic.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
      },
      take: 10,
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    return topics.map((topic) => ({
      key: topic.name,
      id: topic.id,
      description: topic.description,
    }))
  }

  static async extractMentions(
    regex: RegExp,
    content?: string
  ): Promise<string[]> {
    if (!content) {
      return []
    }

    const matches = content.match(regex)

    if (!matches) {
      return []
    }

    const uniqueMentions = [...new Set(matches.map((match) => match.slice(1)))]
    return uniqueMentions
  }

  static async extractUsernames(content?: string): Promise<string[]> {
    return MentionsService.extractMentions(MENTION_USER_REGEX, content)
  }

  static async extractTopics(content?: string): Promise<string[]> {
    return MentionsService.extractMentions(MENTION_TOPIC_REGEX, content)
  }

  async validateMentionedUsers(
    mentionedUsernames: string[]
  ): Promise<{ id: string; username: string }[]> {
    if (mentionedUsernames.length === 0) {
      return []
    }

    const mentionedUsers = await this.prisma.user.findMany({
      where: {
        status: UserStatus.ACTIVE,
        username: {
          in: mentionedUsernames,
        },
      },
      select: {
        id: true,
        username: true,
      },
    })

    return mentionedUsers
  }

  async extractMentions(content: string): Promise<{
    mentionedUsers: { id: string; username: string }[]
    mentionedTopicNames: string[]
  }> {
    // Extract mentions
    const mentionedUsernames = await MentionsService.extractUsernames(content)
    if (mentionedUsernames.length > 10) {
      throw new BadRequestException('You cannot mention more than 10 users')
    }

    // Extract topics
    const mentionedTopicNames = await MentionsService.extractTopics(content)
    if (mentionedTopicNames.length > 10) {
      throw new BadRequestException('You cannot mention more than 10 topics')
    }

    const mentionedUsers = await this.validateMentionedUsers(mentionedUsernames)

    return {
      mentionedUsers,
      mentionedTopicNames,
    }
  }

  async createNotificationsForMentions(
    actorId: string,
    message: string,
    mentionedUsers: { id: string }[],
    options: {
      tx?: Prisma.TransactionClient
      postId?: string
      commentId?: string
      targetType?: string
    } = {}
  ) {
    const client = options.tx || this.prisma

    await Promise.all(
      mentionedUsers.map((user) =>
        client.notification.create({
          data: {
            type: 'MENTION',
            targetUserId: user.id,
            actorId,
            message,
            ...options,
          },
        })
      )
    )
  }
}
