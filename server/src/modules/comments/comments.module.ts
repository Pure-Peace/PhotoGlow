import { Module } from '@nestjs/common'

import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

import { PrismaModule } from '@/infra/prisma/prisma.module'
import { MentionsModule } from '@/modules/mentions/mentions.module'
@Module({
  imports: [PrismaModule, MentionsModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
