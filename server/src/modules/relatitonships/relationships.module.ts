import { Module } from '@nestjs/common'

import { PrismaModule } from '@/infra/prisma/prisma.module'

import { RelationshipsController } from './relationships.controller'
import { RelationshipsService } from './relationships.service'

@Module({
  imports: [PrismaModule],
  controllers: [RelationshipsController],
  providers: [RelationshipsService],
})
export class RelationshipsModule {}
