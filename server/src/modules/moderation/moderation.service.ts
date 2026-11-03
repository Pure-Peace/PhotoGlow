import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name)

  constructor(private prisma: PrismaService) {}

  async reportPost(
    userId: string,
    postId: string,
    reason: string
  ): Promise<boolean> {
    this.logger.log(`User ${userId} reported post ${postId}: ${reason}`)
    return true
  }

  async reportUser(
    userId: string,
    reportedUserId: string,
    reason: string
  ): Promise<boolean> {
    this.logger.log(`User ${userId} reported user ${reportedUserId}: ${reason}`)
    return true
  }
}
