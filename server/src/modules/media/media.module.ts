import { Module } from '@nestjs/common'

import { MediaController } from './media.controller'
import { MediaService } from './media.service'
import { MediaCleanupService } from './media-cleanup.service'

import { PrismaModule } from '@/infra/prisma/prisma.module'
import { S3Module } from '@/infra/s3/s3.module'

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [MediaController],
  providers: [MediaService, MediaCleanupService],
  exports: [MediaService, MediaCleanupService],
})
export class MediaModule {}
