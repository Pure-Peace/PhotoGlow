import { Injectable, Logger, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class TagsService {
  private readonly logger = new Logger(TagsService.name)

  constructor(private prisma: PrismaService) {}

  // Add tag related methods
  async addTagToPost(
    userId: string,
    postId: string,
    tagName: string,
    tagType: string = 'user'
  ): Promise<boolean> {
    // Check if post exists and user is the author
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    })

    if (!post) {
      throw new NotFoundException('Post not found or unauthorized')
    }

    // Create or get tag
    const tag = await this.prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        type: tagType,
      },
    })

    // Connect tag to post
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          connect: { id: tag.id },
        },
      },
    })

    return true
  }

  async removeTagFromPost(
    userId: string,
    postId: string,
    tagName: string
  ): Promise<boolean> {
    // Check if post exists and user is the author
    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        authorId: userId,
      },
    })

    if (!post) {
      throw new NotFoundException('Post not found or unauthorized')
    }

    // Find tag
    const tag = await this.prisma.tag.findUnique({
      where: { name: tagName },
    })

    if (!tag) {
      return false
    }

    // Disconnect tag from post
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        tags: {
          disconnect: { id: tag.id },
        },
      },
    })

    return true
  }
}
