import { Module } from '@nestjs/common'

import { CookieModule } from '@/infra/cookie/cookie.module'
import { PrismaModule } from '@/infra/prisma/prisma.module'
import { EmailModule } from '@/infra/email/email.module'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { TokenModule } from '@/infra/token/token.module'
import { VerificationModule } from '@/infra/verification/verification.module'
import { OauthModule } from '@/infra/oauth/oauth.module'

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    TokenModule,
    VerificationModule,
    CookieModule,
    OauthModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
