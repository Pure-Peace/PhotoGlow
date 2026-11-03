import { Logger, Injectable } from '@nestjs/common'

import { RedisService } from '@/infra/redis/redis.service'
import type { VerificationCodeType } from '@photoglow/shared/types/verification'
import { VERIFICATION_KEY } from '@photoglow/shared/server/constants/verification'

import { verificationKeys } from '@photoglow/shared/env'
import { verificationDefault } from '@photoglow/shared/env'
import ms, { type StringValue } from 'ms'

export const DEFAULT_VERIFICATION_CODE_EXPIRATION =
  verificationDefault.verificationCodeExpiration

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name)
  private readonly verificationCodeExpiration: number
  constructor(private readonly redisService: RedisService) {
    this.verificationCodeExpiration = ms(
      (process.env[verificationKeys.verificationCodeExpiration] ||
        DEFAULT_VERIFICATION_CODE_EXPIRATION) as StringValue
    )

    this.logger.log(
      `[init] Verification code expiration: ${this.verificationCodeExpiration}ms`
    )
  }

  // Helper method to build verification code key
  private redisKey(email: string, type: VerificationCodeType): string {
    return `${VERIFICATION_KEY}${type}:${email}`
  }

  // Store verification code
  async setVerificationCode(
    email: string,
    code: string,
    type: VerificationCodeType,
    expirationSeconds?: number
  ): Promise<'OK'> {
    const key = this.redisKey(email, type)
    return this.redisService.set(
      key,
      code,
      expirationSeconds || this.verificationCodeExpiration
    )
  }

  // Get verification code
  async getVerificationCode(
    email: string,
    type: VerificationCodeType
  ): Promise<string | null> {
    const key = this.redisKey(email, type)
    return this.redisService.get(key)
  }

  // Validate and delete verification code
  async validateVerificationCode(
    email: string,
    code: string,
    type: VerificationCodeType
  ): Promise<boolean> {
    const key = this.redisKey(email, type)
    const storedCode = await this.redisService.get(key)

    if (storedCode === code) {
      // Delete the code after successful validation
      await this.redisService.del(key)
      return true
    }

    return false
  }

  // Delete verification code
  async deleteVerificationCode(
    email: string,
    type: VerificationCodeType
  ): Promise<number> {
    const key = this.redisKey(email, type)
    return this.redisService.del(key)
  }
}
