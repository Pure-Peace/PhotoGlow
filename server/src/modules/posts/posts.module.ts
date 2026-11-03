import { Module } from '@nestjs/common'

import { PostsController } from './posts.controller'
import { PostsService } from './posts.service'

import { PrismaModule } from '@/infra/prisma/prisma.module'
import { CommentsModule } from '@/modules/comments/comments.module'
import { MentionsModule } from '@/modules/mentions/mentions.module'
@Module({
  imports: [PrismaModule, CommentsModule, MentionsModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
