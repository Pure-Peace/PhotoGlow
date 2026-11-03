import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { UserStatus, type Prisma, type User } from '@photoglow/database'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { sanitizeUser } from '@/common/utils/common'

import { CreatePostDto, UpdatePostDto } from '@/modules/posts/dto/post.dto'
import { CommentsService } from '@/modules/comments/comments.service'
import { MentionsService } from '@/modules/mentions/mentions.service'
import type { PostWithAuthor } from '@photoglow/shared/types/post'
import type { SanitizedUser } from '@photoglow/shared/types/user'

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name)

  constructor(
    private prisma: PrismaService,
    private readonly commentsService: CommentsService,
    private readonly mentionsService: MentionsService
  ) {}

  async getPost(postId: string, userId?: string): Promise<any> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: true,
        media: {
          orderBy: {
            order: 'asc',
          },
        },
        comments: {
          where: {
            parentId: null, // Only get parent comments
          },
          include: {
            author: true,
          },
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
        location: true,
      },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    // Get like count
    const likesCount = await this.prisma.like.count({
      where: { postId },
    })

    // Get save count
    const savesCount = await this.prisma.save.count({
      where: { postId },
    })

    // Get comment count
    const commentsCount = await this.prisma.comment.count({
      where: { postId },
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
          postId,
        },
      })
      hasLiked = !!like

      // Check if user has saved post
      const save = await this.prisma.save.findFirst({
        where: {
          userId,
          postId,
        },
      })
      hasSaved = !!save

      // Check if user has commented on post
      const comment = await this.prisma.comment.findFirst({
        where: {
          authorId: userId,
          postId,
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

    // Format comments using shared method
    const formattedComments = await this.commentsService.formatComments(
      post.comments,
      userId
    )

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
          count: 0, // Not implemented yet
          hasShared: false,
        },
      },
      content: post.content || '',
      location: post.location
        ? {
            name: post.location.name,
            city: post.location.city,
            country: post.location.country,
          }
        : undefined,
      comments: formattedComments,
    }
  }

  async getPosts(
    userId?: string,
    filter?: 'following',
    limit: number = 24,
    offset: number = 0,
    order: 'asc' | 'desc' = 'desc',
    username?: string,
    type: 'posts' | 'saved' | 'liked' | 'all' = 'all'
  ): Promise<any[]> {
    let whereClause: any = {}
    let posts: PostWithAuthor[] = []

    if (limit > 36) {
      throw new BadRequestException('Limit cannot be greater than 36')
    }

    // If username is provided, we're getting posts for a specific user
    if (username) {
      const user = await this.prisma.user.findUnique({
        where: { username, status: UserStatus.ACTIVE },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      if (type === 'posts') {
        // Get user's posts
        whereClause.authorId = user.id

        // If viewing own posts or if no user is logged in
        if (!userId) {
          whereClause.visibility = 'PUBLIC'
        } else if (userId === user.id) {
          // If viewing own posts, show all posts
          // No visibility filter needed
        } else {
          // Check if the current user follows the target user
          const isFollowing = await this.prisma.follow.findFirst({
            where: {
              followerId: userId,
              followingId: user.id,
            },
          })

          whereClause.OR = [
            { visibility: 'PUBLIC' },
            // Include FOLLOWERS posts if the user is following
            isFollowing ? { visibility: 'FOLLOWERS' } : null,
          ].filter(Boolean) // Remove null values
        }

        posts = await this.prisma.post.findMany({
          where: whereClause,
          include: {
            author: true,
            media: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: order,
          },
          take: limit,
          skip: offset,
        })
      } else if (type === 'saved') {
        // Get user's saved posts
        const savedPosts = await this.prisma.save.findMany({
          where: {
            userId: user.id,
          },
          include: {
            post: {
              include: {
                author: true,
                media: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: order,
          },
          take: limit,
          skip: offset,
        })

        posts = savedPosts.map((savedPost) => savedPost.post)
      } else if (type === 'liked') {
        // Get user's liked posts
        const likedPosts = await this.prisma.like.findMany({
          where: {
            userId: user.id,
            postId: {
              not: null,
            },
          },
          include: {
            post: {
              include: {
                author: true,
                media: {
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: order,
          },
          take: limit,
          skip: offset,
        })

        posts = likedPosts
          .map((likedPost) => likedPost.post)
          .filter((post) => post !== null)
      }
    } else {
      // Original getPosts logic for feed
      if (userId) {
        // Get the IDs of users that the current user has blocked
        const blockedUsers = await this.prisma.block.findMany({
          where: {
            blockerId: userId,
          },
          select: {
            blockedId: true,
          },
        })

        const blockedUserIds = blockedUsers.map((block) => block.blockedId)

        // Add condition to exclude posts from blocked users
        whereClause = {
          ...whereClause,
          authorId: {
            notIn: blockedUserIds,
          },
        }
      }

      if (filter === 'following' && userId) {
        // Get the IDs of users that the current user follows
        const following = await this.prisma.follow.findMany({
          where: {
            followerId: userId,
          },
          select: {
            followingId: true,
          },
        })

        const followingIds = following.map((f) => f.followingId)

        // Update authorId condition to include both following and not blocked
        whereClause = {
          ...whereClause,
          authorId: {
            ...whereClause.authorId,
            in: followingIds,
          },
          OR: [
            { visibility: 'PUBLIC' },
            { visibility: 'FOLLOWERS' }, // Since we're already filtering by followingIds, we can include FOLLOWERS posts
          ],
        }
      } else {
        // For non-following feed, only show PUBLIC posts
        whereClause.visibility = 'PUBLIC'
      }

      posts = await this.prisma.post.findMany({
        where: whereClause,
        include: {
          author: true,
          media: {
            orderBy: {
              order: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: order,
        },
        take: limit,
        skip: offset,
      })
    }

    // Format posts (common for all cases)
    const formattedPosts = await Promise.all(
      posts.map(async (post) => {
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
              count: 0, // Not implemented yet
              hasShared: false,
            },
          },
          content: post.content || '',
        }
      })
    )

    return formattedPosts
  }

  private async createOrUpdateTopics(
    topicNames: string[],
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || this.prisma

    const topics = await Promise.all(
      topicNames.map(async (name) => {
        // Try to find existing topic or create new one
        const topic = await client.topic.upsert({
          where: { name },
          update: {},
          create: {
            name,
            description: `Posts tagged with #${name}`,
          },
        })
        return { id: topic.id, name: topic.name }
      })
    )

    return topics
  }

  async createPost(
    userId: string,
    createPostDto: CreatePostDto
  ): Promise<string> {
    const {
      title,
      content,
      visibility,
      type = 'PHOTO',
      media,
      locationId,
      topicIds = [],
    } = createPostDto

    if (!media || media.length === 0) {
      throw new BadRequestException('At least one media item is required')
    }

    // Validate title
    if (!title || title.trim().length < 1) {
      throw new BadRequestException('Title must be at least 1 characters long')
    }

    // Sort media by order if provided
    const sortedMedia = [...media].sort(
      (a, b) => (a.order || 0) - (b.order || 0)
    )

    // Use the first media item as the cover
    const firstMedia = sortedMedia[0]

    // Extract mentions and topics
    let mentionedUsers: { id: string; username: string }[] = []
    let mentionedTopicNames: string[] = []

    if (content) {
      const extracted = await this.mentionsService.extractMentions(content)

      mentionedUsers = extracted.mentionedUsers
      mentionedTopicNames = extracted.mentionedTopicNames
    }

    // Create post in a transaction to ensure all operations succeed or fail together
    const postId = await this.prisma.$transaction(async (tx) => {
      const topics = await this.createOrUpdateTopics(mentionedTopicNames, tx)

      // Create the post
      const post = await tx.post.create({
        data: {
          title,
          content,
          visibility,
          authorId: userId,
          type,
          // Use the cover we generated or the original media URL
          cover: firstMedia.url,
          // Add locationId if provided
          ...(locationId ? { locationId } : {}),
          // Connect topics to the post
          topics: {
            connect: [
              ...topics.map((topic) => ({ id: topic.id })),
              ...topicIds.map((id) => ({ id })),
            ],
          },
          // Connect tags if provided
          ...(createPostDto.tagIds && createPostDto.tagIds.length > 0
            ? {
                tags: {
                  connect: createPostDto.tagIds.map((id) => ({ id })),
                },
              }
            : {}),
        },
      })

      // Create media entries
      await Promise.all(
        sortedMedia.map((mediaItem) =>
          tx.media.create({
            data: {
              url: mediaItem.url,
              type: mediaItem.type,
              alt: mediaItem.alt,
              order: mediaItem.order || 0,
              postId: post.id,
            },
          })
        )
      )

      // Update MediaDraft status for all media used in this post
      // We handle both URL matching and draftId matching
      const mediaUrls = sortedMedia.map((item) => item.url)
      const draftIds = sortedMedia
        .filter((item) => item.draftId)
        .map((item) => item.draftId) as string[]

      // First update based on URLs if there are any
      if (mediaUrls.length > 0) {
        await tx.mediaDraft.updateMany({
          where: {
            userId,
            url: { in: mediaUrls },
            status: 'PENDING',
          },
          data: {
            status: 'USED',
            used: true,
            postId: post.id,
          },
        })
      }

      // Then update based on draftIds if there are any
      if (draftIds.length > 0) {
        await tx.mediaDraft.updateMany({
          where: {
            userId,
            id: { in: draftIds },
            status: 'PENDING',
          },
          data: {
            status: 'USED',
            used: true,
            postId: post.id,
          },
        })
      }

      return post.id
    })

    // Last, create notifications for mentioned users
    try {
      await this.mentionsService.createNotificationsForMentions(
        userId,
        'mentioned you in a post',
        mentionedUsers,
        { postId, targetType: 'post' }
      )
    } catch (error) {
      this.logger.error(
        `Error creating notifications for mentioned users: ${error}`
      )
    }

    return postId
  }

  async updatePost(
    userId: string,
    postId: string,
    updatePostDto: UpdatePostDto
  ): Promise<boolean> {
    const {
      title,
      content,
      visibility,
      locationId,
      type,
      media,
      topicIds,
      tagIds,
    } = updatePostDto

    // Check if post exists and user is the author
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to update this post'
      )
    }

    // Extract mentions and topics
    let mentionedUsers: { id: string; username: string }[] = []
    let mentionedTopicNames: string[] = []

    if (content) {
      const extracted = await this.mentionsService.extractMentions(content)

      mentionedUsers = extracted.mentionedUsers
      mentionedTopicNames = extracted.mentionedTopicNames
    }

    // Update post in a transaction to ensure all operations succeed or fail together
    await this.prisma.$transaction(async (tx) => {
      // Basic post data update
      const updateData: any = {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(locationId !== undefined ? { locationId } : {}),
      }

      // Update post with basic data
      await tx.post.update({
        where: { id: postId },
        data: updateData,
      })

      // Handle media updates if provided
      if (media && media.length > 0) {
        // First delete existing media
        await tx.media.deleteMany({
          where: { postId },
        })

        // Then create new media entries
        await Promise.all(
          media.map((mediaItem) =>
            tx.media.create({
              data: {
                url: mediaItem.url,
                type: mediaItem.type,
                alt: mediaItem.alt,
                order: mediaItem.order || 0,
                postId,
              },
            })
          )
        )

        // Update cover with first media
        await tx.post.update({
          where: { id: postId },
          data: { cover: media[0].url },
        })

        // Update MediaDraft status for all new media used in this post
        // We handle both URL matching and draftId matching
        const mediaUrls = media.map((item) => item.url)
        const draftIds = media
          .filter((item) => item.draftId)
          .map((item) => item.draftId) as string[]

        // First update based on URLs if there are any
        if (mediaUrls.length > 0) {
          await tx.mediaDraft.updateMany({
            where: {
              userId,
              url: { in: mediaUrls },
              status: 'PENDING',
            },
            data: {
              status: 'USED',
              used: true,
              postId,
            },
          })
        }

        // Then update based on draftIds if there are any
        if (draftIds.length > 0) {
          await tx.mediaDraft.updateMany({
            where: {
              userId,
              id: { in: draftIds },
              status: 'PENDING',
            },
            data: {
              status: 'USED',
              used: true,
              postId,
            },
          })
        }
      }

      // Handle topic updates, including extracted #topics
      // First remove all existing topic connections
      await tx.post.update({
        where: { id: postId },
        data: { topics: { set: [] } },
      })

      const topics = await this.createOrUpdateTopics(mentionedTopicNames, tx)

      // Then add the new ones from both explicit topicIds and extracted #topics
      const allTopicIds = [
        ...topics.map((topic) => ({ id: topic.id })),
        ...(topicIds || []).map((id) => ({ id })),
      ]

      if (allTopicIds.length > 0) {
        await tx.post.update({
          where: { id: postId },
          data: {
            topics: {
              connect: allTopicIds,
            },
          },
        })
      }

      // Handle tag updates if provided
      if (tagIds !== undefined) {
        // First remove all existing tag connections
        await tx.post.update({
          where: { id: postId },
          data: { tags: { set: [] } },
        })

        // Then add the new ones
        if (tagIds.length > 0) {
          await tx.post.update({
            where: { id: postId },
            data: {
              tags: {
                connect: tagIds.map((id) => ({ id })),
              },
            },
          })
        }
      }
    })

    try {
      // Last, create notifications for mentioned users
      await this.mentionsService.createNotificationsForMentions(
        userId,
        'updated their post',
        mentionedUsers,
        { postId, targetType: 'post' }
      )
    } catch (error) {
      this.logger.error(
        `Error creating notifications for mentioned users: ${error}`
      )
    }

    return true
  }

  async deletePost(userId: string, postId: string): Promise<boolean> {
    // Check if post exists and user is the author
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      throw new NotFoundException('Post not found')
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this post'
      )
    }

    // Delete post
    await this.prisma.post.delete({
      where: { id: postId },
    })

    return true
  }
}
