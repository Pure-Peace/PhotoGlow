import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { CreateCommentDto } from '@/modules/comments/dto/comment.dto'
import { sanitizeUser } from '@/common/utils/common'
import { MentionsService } from '@/modules/mentions/mentions.service'
import { UserStatus } from '@photoglow/database'
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name)

  constructor(
    private prisma: PrismaService,
    private mentionsService: MentionsService
  ) {}

  async formatComments(comments: any[], userId?: string): Promise<any[]> {
    return Promise.all(
      comments.map(async (comment) => {
        // Get like count for comment
        const likesCount = await this.prisma.like.count({
          where: { commentId: comment.id },
        })

        // Get reply count for comment
        const repliesCount = await this.prisma.comment.count({
          where: { parentId: comment.id },
        })

        // Check if user has liked this comment
        let hasLiked = false
        if (userId) {
          const like = await this.prisma.like.findFirst({
            where: {
              userId,
              commentId: comment.id,
            },
          })
          hasLiked = !!like
        }

        // Get parent comment info if this is a reply
        let replyTo = null
        let level = 0
        if (comment.parentId) {
          const parentComment = await this.prisma.comment.findUnique({
            where: { id: comment.parentId },
            include: { author: true },
          })
          if (parentComment) {
            replyTo =
              parentComment.author.displayName || parentComment.author.username
            // If parent comment is already a reply, this is a level 2 comment
            level = parentComment.parentId ? 2 : 1
          }
        }

        return {
          id: comment.id,
          content: comment.content,
          author: sanitizeUser(comment.author),
          createdAt: comment.createdAt.toISOString(),
          likes: likesCount,
          repliesCount,
          hasLiked,
          parentId: comment.parentId,
          replyTo,
          level,
        }
      })
    )
  }

  async getPostComments(
    postId: string,
    userId?: string,
    parentId?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any[]> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // If parentId is provided, get replies for that comment
    // Otherwise get top-level comments for the post
    const comments = await this.prisma.comment.findMany({
      where: {
        postId,
        parentId: parentId || null,
      },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    return this.formatComments(comments, userId)
  }

  async createComment(
    userId: string,
    postId: string,
    createCommentDto: CreateCommentDto
  ): Promise<boolean> {
    const { content, parentId } = createCommentDto

    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, status: true } } },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // If this is a reply, check if parent comment exists and validate comment level
    let parentCommentWithAuthor = null
    if (parentId) {
      parentCommentWithAuthor = await this.prisma.comment.findUnique({
        where: { id: parentId },
        include: {
          author: { select: { id: true, username: true, status: true } },
        },
      })

      if (!parentCommentWithAuthor) {
        throw new NotFoundException('Parent comment not found')
      }

      // Check if parent comment belongs to the same post
      if (parentCommentWithAuthor.postId !== postId) {
        throw new BadRequestException(
          'Parent comment does not belong to this post'
        )
      }

      // Check comment level
      // If parent comment already has a parentId (is a reply), check if it's a reply to a reply
      if (parentCommentWithAuthor.parentId) {
        const grandParentComment = await this.prisma.comment.findUnique({
          where: { id: parentCommentWithAuthor.parentId },
        })

        // If grandparent comment has a parent, this would be a 4th level comment which is not allowed
        if (grandParentComment?.parentId) {
          throw new BadRequestException(
            'Comments can only be nested up to 3 levels'
          )
        }
      }
    }

    // Create comment
    const comment = await this.prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
        parentId,
      },
    })

    // create notifications
    try {
      const { mentionedUsers } =
        await this.mentionsService.extractMentions(content)

      // mentions
      if (mentionedUsers.length > 0) {
        await this.mentionsService.createNotificationsForMentions(
          userId,
          'mentioned you in a comment',
          mentionedUsers,
          { commentId: comment.id, targetType: 'comment', postId }
        )
      }

      // reply notifications
      if (parentId && parentCommentWithAuthor) {
        // Create notification for post author
        if (
          post.author.status === UserStatus.ACTIVE &&
          post.authorId !== userId
        ) {
          await this.prisma.notification.create({
            data: {
              type: 'comment',
              actorId: userId,
              targetUserId: post.authorId,
              message: `replied to ${parentCommentWithAuthor.author.username}'s comment on your post`,
              targetType: 'post',
              postId: postId,
              commentId: comment.id,
            },
          })
        }

        // Notify the parent comment author
        if (
          parentCommentWithAuthor.author.status === UserStatus.ACTIVE &&
          parentCommentWithAuthor.authorId !== userId
        ) {
          await this.prisma.notification.create({
            data: {
              type: 'reply',
              actorId: userId,
              targetUserId: parentCommentWithAuthor.authorId,
              message: 'replied to your comment',
              targetType: 'comment',
              commentId: parentId,
            },
          })
        }
      } else {
        // Create notification for post author if this is a direct comment
        if (
          post.author.status === UserStatus.ACTIVE &&
          post.authorId !== userId
        ) {
          await this.prisma.notification.create({
            data: {
              type: 'comment',
              actorId: userId,
              targetUserId: post.authorId,
              message: 'commented on your post',
              targetType: 'post',
              postId: postId,
              commentId: comment.id,
            },
          })
        }
      }
    } catch (error) {
      this.logger.error(
        `Error creating notifications for mentioned users: ${error}`
      )
    }

    return true
  }

  async deleteComment(userId: string, commentId: string): Promise<boolean> {
    // Check if comment exists and user is the author
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    })

    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    if (comment.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this comment'
      )
    }

    // Delete comment
    await this.prisma.comment.delete({
      where: { id: commentId },
    })

    return true
  }
}
