import { Module } from '@nestjs/common'

import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

import { PrismaModule } from '@/infra/prisma/prisma.module'
import { VerificationModule } from '@/infra/verification/verification.module'
import { TokenModule } from '@/infra/token/token.module'
@Module({
  imports: [PrismaModule, VerificationModule, TokenModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
