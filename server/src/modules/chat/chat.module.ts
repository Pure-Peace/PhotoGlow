import { Module } from '@nestjs/common'

import { PrismaModule } from '@/infra/prisma/prisma.module'

import { ChatController } from './chat.controller'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { TokenModule } from '@/infra/token/token.module'
@Module({
  imports: [PrismaModule, TokenModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}
