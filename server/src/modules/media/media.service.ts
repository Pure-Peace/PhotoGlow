import { Injectable, Logger } from '@nestjs/common'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { S3Service } from '@/infra/s3/s3.service'

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)

  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
  ) {}

  // Get pending media drafts for the current user
  async getUserMediaDrafts(userId: string): Promise<any[]> {
    const now = new Date()

    // Find all pending media drafts for the user that haven't expired
    const mediaDrafts = await this.prisma.mediaDraft.findMany({
      where: {
        userId,
        status: 'PENDING',
        used: false,
        expiresAt: { gt: now },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Format the response to match the UploadMediaResponse type used in the frontend
    return mediaDrafts.map((draft) => ({
      url: draft.url,
      draftId: draft.id,
      mediaType: draft.type === 'image' ? 'image' : 'video',
    }))
  }

  async uploadMedia(
    userId: string,
    file: Express.Multer.File
  ): Promise<{ url: string; draftId: string }> {
    // Upload file to S3
    const uploadResult = await this.s3Service.uploadFile(file, 'media')

    // Create a media draft entry that expires in 24 hours
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    const mediaDraft = await this.prisma.mediaDraft.create({
      data: {
        userId,
        url: uploadResult.url,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        size: file.size,
        status: 'PENDING',
        expiresAt,
      },
    })

    // Update user's media stats
    await this.prisma.mediaStats.upsert({
      where: { userId },
      update: {
        totalUploads: { increment: 1 },
        totalSize: { increment: file.size },
        lastUploadAt: new Date(),
      },
      create: {
        userId,
        totalUploads: 1,
        totalSize: file.size,
        lastUploadAt: new Date(),
      },
    })

    return { url: uploadResult.url, draftId: mediaDraft.id }
  }
}
