import { Module, Global } from '@nestjs/common'

import { PrismaModule } from '@/infra/prisma/prisma.module'

import { TokenService } from '@/infra/token/token.service'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'

@Global()
@Module({
  imports: [PrismaModule],
  providers: [TokenService, JwtAuthGuard],
  exports: [TokenService, JwtAuthGuard],
})
export class GlobalModule {}
