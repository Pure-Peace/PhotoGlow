import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class MediaCleanupService {
  private readonly logger = new Logger(MediaCleanupService.name)

  constructor(private readonly prisma: PrismaService) {}

  // Run every day at midnight to clean up expired media drafts
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredMediaDrafts() {
    this.logger.log('Starting cleanup of expired media drafts')
    try {
      const count = await this.handleCleanupExpiredMediaDrafts()
      this.logger.log(`Successfully cleaned up ${count} expired media drafts`)
    } catch (error) {
      this.logger.error('Failed to clean up expired media drafts', error)
    }
  }

  // Also run every hour to clean up recently expired drafts
  @Cron(CronExpression.EVERY_HOUR)
  async hourlyCleanup() {
    this.logger.log('Starting hourly cleanup of expired media drafts')
    try {
      const count = await this.handleCleanupExpiredMediaDrafts()
      if (count > 0) {
        this.logger.log(`Hourly cleanup: removed ${count} expired media drafts`)
      }
    } catch (error) {
      this.logger.error('Failed to perform hourly cleanup', error)
    }
  }

  // Clean up expired media drafts (can be called by a cron job)
  async handleCleanupExpiredMediaDrafts(): Promise<number> {
    const now = new Date()

    // Find and delete expired drafts
    const result = await this.prisma.mediaDraft.deleteMany({
      where: {
        expiresAt: { lt: now },
        status: 'PENDING',
        used: false,
      },
    })

    this.logger.log(`Cleaned up ${result.count} expired media drafts`)
    return result.count
  }
}
