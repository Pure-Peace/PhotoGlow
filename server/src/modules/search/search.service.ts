import { Injectable, Logger } from '@nestjs/common'

import { PostVisibility } from '@photoglow/shared/types/post'
import { sanitizeUser } from '@/common/utils/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { UserStatus } from '@photoglow/database'

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(private prisma: PrismaService) {}

  async search(
    query: string,
    userId?: string
  ): Promise<{ posts: any[]; users: any[]; topics: any[] }> {
    if (!query || query.trim().length === 0) {
      return { posts: [], users: [], topics: [] }
    }

    // Search for posts
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        visibility: PostVisibility.PUBLIC,
      },
      include: {
        author: true,
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    // Search for users
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            displayName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            bio: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        status: UserStatus.ACTIVE,
      },
      take: 20,
    })

    // Search for topics
    const topics = await this.prisma.topic.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
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
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: 10,
    })

    // Process posts to include counts and interaction data
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
        // Get post statistics
        const likesCount = await this.prisma.like.count({
          where: { postId: post.id },
        })

        const savesCount = await this.prisma.save.count({
          where: { postId: post.id },
        })

        const commentsCount = await this.prisma.comment.count({
          where: { postId: post.id },
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
          type: post.type,
          title: post.title,
          content: post.content || '',
          visibility: post.visibility,
          cover: post.cover,
          likesCount,
          savesCount,
          commentsCount,
          score: post.score,
          lastActiveAt: post.lastActiveAt,
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
          // Include interactions for backward compatibility with frontend
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
        }
      })
    )

    // Process users to include relationship and counts
    const formattedUsers = await Promise.all(
      users.map(async (user) => {
        // Get follower and following counts
        const followersCount = await this.prisma.follow.count({
          where: { followingId: user.id },
        })

        const followingCount = await this.prisma.follow.count({
          where: { followerId: user.id },
        })

        // Initialize relationship status
        let relationship = {
          isFollowing: false,
          isFollowedBy: false,
          isBlocked: false,
        }

        // If userId is provided, check relationship status
        if (userId && userId !== user.id) {
          // Check if authenticated user is following the user
          const following = await this.prisma.follow.findFirst({
            where: {
              followerId: userId,
              followingId: user.id,
            },
          })
          relationship.isFollowing = !!following

          // Check if user is following the authenticated user
          const followedBy = await this.prisma.follow.findFirst({
            where: {
              followerId: user.id,
              followingId: userId,
            },
          })
          relationship.isFollowedBy = !!followedBy

          // Check if authenticated user has blocked the user
          const blocked = await this.prisma.block.findFirst({
            where: {
              blockerId: userId,
              blockedId: user.id,
            },
          })
          relationship.isBlocked = !!blocked
        }

        return {
          ...sanitizeUser(user),
          type: 'user',
          followersCount,
          followingCount,
          relationship,
        }
      })
    )

    // Format topics
    const formattedTopics = topics.map((topic) => ({
      id: topic.id,
      type: 'topic',
      name: topic.name,
      description: topic.description,
      postCount: topic._count.posts,
    }))

    return {
      posts: formattedPosts,
      users: formattedUsers,
      topics: formattedTopics,
    }
  }
}
