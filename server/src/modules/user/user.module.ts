import { Module } from '@nestjs/common'

import { UserController } from './user.controller'
import { UserService } from './user.service'

import { PrismaModule } from '@/infra/prisma/prisma.module'
import { S3Module } from '@/infra/s3/s3.module'
import { CookieModule } from '@/infra/cookie/cookie.module'
import { TokenModule } from '@/infra/token/token.module'
@Module({
  imports: [PrismaModule, S3Module, CookieModule, TokenModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
