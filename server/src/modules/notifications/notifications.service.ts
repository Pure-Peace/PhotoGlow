import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(private prisma: PrismaService) {}

  async getUnreadNotificationAndChatCount(userId: string) {
    const unreadNotificationCount = await this.prisma.notification.count({
      where: { targetUserId: userId, read: false },
    })

    const unreadChatCount = await this.prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        senderId: { not: userId },
        read: false,
      },
    })

    return {
      unreadNotificationCount,
      unreadChatCount,
    }
  }

  /**
   * Retrieves all notifications for a specific user along with unread chat count
   * @param userId - The ID of the user to get notifications for
   * @returns Object containing an array of notifications and unread chat count
   * @throws {UnauthorizedException} If the user is not found
   */
  async getNotifications(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ notifications: any[]; unreadChatCount: number }> {
    const notifications = await this.prisma.notification.findMany({
      where: { targetUserId: userId },
      include: {
        actor: true,
        post: {
          select: {
            id: true,
            title: true,
            cover: true,
            content: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Get unread chat count
    const unreadChatCount = await this.prisma.message.count({
      where: {
        conversation: {
          participants: {
            some: {
              id: userId,
            },
          },
        },
        senderId: { not: userId },
        read: false,
      },
    })

    const formattedNotifications = notifications.map((notification) => {
      const postInfo = notification.post
      const postPreview = postInfo?.content
        ? postInfo.content.slice(0, 20) +
          (postInfo.content.length > 20 ? '...' : '')
        : null

      return {
        id: notification.id,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
        actor: {
          id: notification.actor.id,
          username: notification.actor.username,
          displayName:
            notification.actor.displayName || notification.actor.username,
          avatar: notification.actor.avatar,
        },
        postId: notification.postId,
        commentId: notification.commentId,
        targetType: notification.targetType,
        message: notification.message,
        post: postInfo
          ? {
              id: postInfo.id,
              title: postInfo.title,
              cover: postInfo.cover,
              preview: postPreview,
            }
          : null,
        commentContent: notification.comment?.content || null,
      }
    })

    return {
      notifications: formattedNotifications,
      unreadChatCount,
    }
  }

  /**
   * Marks multiple notifications as read for a specific user
   * @param userId - The ID of the user who owns the notifications
   * @param notificationIds - Array of notification IDs to mark as read
   * @returns Boolean indicating success
   * @throws {UnauthorizedException} If the user is not authorized to update these notifications
   */
  async markNotificationsAsRead(
    userId: string,
    notificationIds: string[]
  ): Promise<boolean> {
    await this.prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        targetUserId: userId,
      },
      data: {
        read: true,
      },
    })

    return true
  }

  /**
   * Deletes a specific notification for a user
   * @param userId - The ID of the user who owns the notification
   * @param notificationId - The ID of the notification to delete
   * @returns Boolean indicating success
   * @throws {NotFoundException} If the notification is not found
   * @throws {UnauthorizedException} If the user is not authorized to delete this notification
   */
  async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<boolean> {
    // Check if notification exists and belongs to the user
    const notification = await this.prisma.notification.findFirst({
      where: {
        id: notificationId,
        targetUserId: userId,
      },
    })

    if (!notification) {
      throw new NotFoundException('Notification not found')
    }

    // Delete the notification
    await this.prisma.notification.delete({
      where: {
        id: notificationId,
      },
    })

    return true
  }
}
