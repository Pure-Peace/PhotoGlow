import { Module } from '@nestjs/common'

import { PrismaModule } from '@/infra/prisma/prisma.module'

import { TokenService } from './token.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'

@Module({
  imports: [PrismaModule],
  providers: [TokenService, JwtAuthGuard],
  exports: [TokenService, JwtAuthGuard],
})
export class TokenModule {}
