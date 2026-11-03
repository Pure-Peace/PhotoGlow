import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { sanitizeUser } from '@/common/utils/common'

@Injectable()
export class TopicsService {
  private readonly logger = new Logger(TopicsService.name)

  constructor(private prisma: PrismaService) {}

  async getPopularTopics() {
    // Get topics with their post counts
    const topics = await this.prisma.topic.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    return topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      postCount: topic._count.posts,
    }))
  }

  async getTopic(topicName: string, userId?: string) {
    const topic = await this.prisma.topic.findFirst({
      where: {
        name: topicName,
      },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    })

    if (!topic) {
      throw new NotFoundException('Topic not found')
    }

    return {
      id: topic.id,
      name: topic.name,
      description: topic.description,
      postCount: topic._count.posts,
    }
  }

  async getTopicPosts(
    topicName: string,
    userId?: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<any> {
    // Find topic
    const topic = await this.prisma.topic.findUnique({
      where: { name: topicName },
      include: {
        posts: {
          include: {
            author: true,
            media: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: limit,
          skip: offset,
        },
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!topic) {
      throw new NotFoundException('Topic not found')
    }

    // Format posts with interaction information
    const formattedPosts = await Promise.all(
      topic.posts.map(async (post) => {
        // Get like count
        const likesCount = await this.prisma.like.count({
          where: { postId: post.id },
        })

        // Get save count
        const savesCount = await this.prisma.save.count({
          where: { postId: post.id },
        })

        // Get comment count
        const commentsCount = await this.prisma.comment.count({
          where: { postId: post.id },
        })

        // Get post tags
        const tags = await this.prisma.tag.findMany({
          where: {
            posts: {
              some: {
                id: post.id,
              },
            },
          },
        })

        // Check if authenticated user has liked, saved, commented
        let hasLiked = false
        let hasSaved = false
        let hasCommented = false
        let relationship = {
          isFollowing: false,
          isFollowedBy: false,
          isBlocked: false,
        }

        if (userId) {
          // Check if user has liked post
          const like = await this.prisma.like.findFirst({
            where: {
              userId,
              postId: post.id,
            },
          })
          hasLiked = !!like

          // Check if user has saved post
          const save = await this.prisma.save.findFirst({
            where: {
              userId,
              postId: post.id,
            },
          })
          hasSaved = !!save

          // Check if user has commented on post
          const comment = await this.prisma.comment.findFirst({
            where: {
              authorId: userId,
              postId: post.id,
            },
          })
          hasCommented = !!comment

          // Get relationship with author
          if (post.authorId !== userId) {
            const following = await this.prisma.follow.findFirst({
              where: {
                followerId: userId,
                followingId: post.authorId,
              },
            })
            relationship.isFollowing = !!following

            const followedBy = await this.prisma.follow.findFirst({
              where: {
                followerId: post.authorId,
                followingId: userId,
              },
            })
            relationship.isFollowedBy = !!followedBy

            const blocked = await this.prisma.block.findFirst({
              where: {
                blockerId: userId,
                blockedId: post.authorId,
              },
            })
            relationship.isBlocked = !!blocked
          }
        }

        return {
          id: post.id,
          title: post.title,
          type: post.type,
          visibility: post.visibility,
          cover: post.cover,
          author: {
            ...sanitizeUser(post.author),
            relationship,
          },
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          media: post.media.map((media) => ({
            url: media.url,
            type: media.type,
            alt: media.alt || '',
          })),
          interactions: {
            likes: {
              count: likesCount,
              hasLiked,
            },
            saves: {
              count: savesCount,
              hasSaved,
            },
            comments: {
              count: commentsCount,
              hasCommented,
            },
            shares: {
              count: 0,
              hasShared: false,
            },
          },
          content: post.content || '',
          tags: tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            type: tag.type,
          })),
        }
      })
    )

    return {
      topic: {
        id: topic.id,
        name: topic.name,
        description: topic.description,
        postCount: topic._count.posts,
      },
      posts: formattedPosts,
    }
  }
}
