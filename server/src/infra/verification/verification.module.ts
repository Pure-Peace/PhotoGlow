import { Module } from '@nestjs/common'

import { VerificationService } from './verification.service'
import { RedisModule } from '@/infra/redis/redis.module'

@Module({
  imports: [RedisModule],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
