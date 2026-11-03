import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { UserStatus } from '@photoglow/database'

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name)

  constructor(private prisma: PrismaService) {}

  async likeComment(
    userId: string,
    commentId: string,
    liked: boolean
  ): Promise<boolean> {
    // Check if comment exists
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: { id: true, status: true } } },
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    if (liked) {
      // Create like if it doesn't exist
      await this.prisma.like.upsert({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
        update: {},
        create: {
          userId,
          commentId,
        },
      })

      // Create notification for comment author
      if (
        comment.author.status === UserStatus.ACTIVE &&
        comment.authorId !== userId
      ) {
        await this.prisma.notification.create({
          data: {
            type: 'like',
            actorId: userId,
            targetUserId: comment.authorId,
            message: 'liked your comment',
            targetType: 'comment',
            commentId: commentId,
          },
        })
      }
    } else {
      // Delete like if it exists
      await this.prisma.like.deleteMany({
        where: {
          userId,
          commentId,
        },
      })
    }

    return liked
  }

  async likePost(
    userId: string,
    postId: string,
    liked: boolean
  ): Promise<boolean> {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, status: true } } },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (liked) {
      // Create like if it doesn't exist
      await this.prisma.like.upsert({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        update: {},
        create: {
          userId,
          postId,
        },
      })

      // Create notification for post author
      if (
        post.author.status === UserStatus.ACTIVE &&
        post.authorId !== userId
      ) {
        await this.prisma.notification.create({
          data: {
            type: 'like',
            actorId: userId,
            targetUserId: post.authorId,
            message: 'liked your post',
            targetType: 'post',
            postId: postId,
          },
        })
      }
    } else {
      // Delete like if it exists
      await this.prisma.like.deleteMany({
        where: {
          userId,
          postId,
        },
      })
    }

    return liked
  }

  async savePost(
    userId: string,
    postId: string,
    saved: boolean
  ): Promise<boolean> {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (saved) {
      // Create save if it doesn't exist
      await this.prisma.save.upsert({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
        update: {},
        create: {
          userId,
          postId,
        },
      })
    } else {
      // Delete save if it exists
      await this.prisma.save.deleteMany({
        where: {
          userId,
          postId,
        },
      })
    }

    return saved
  }
}
