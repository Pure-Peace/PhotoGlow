import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { AccessToken, RefreshToken } from '@/common/utils/token'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { tokenKeys, tokenDefault } from '@photoglow/shared/env'
import ms, { type StringValue } from 'ms'
import type { Prisma } from '@photoglow/database'

export const DEFAULT_ACCESS_TOKEN_EXPIRATION =
  tokenDefault.accessTokenExpiration

export const DEFAULT_REFRESH_TOKEN_EXPIRATION =
  tokenDefault.refreshTokenExpiration

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name)

  private readonly accessTokenExpiration: number
  private readonly refreshTokenExpiration: number

  constructor(
    private readonly jwtService: JwtService,

    private readonly prisma: PrismaService
  ) {
    this.accessTokenExpiration = ms(
      (process.env[tokenKeys.accessTokenExpiration] ||
        DEFAULT_ACCESS_TOKEN_EXPIRATION) as StringValue
    )

    this.logger.log(
      `[init] Access token expiration: ${this.accessTokenExpiration}ms`
    )

    this.refreshTokenExpiration = ms(
      (process.env[tokenKeys.refreshTokenExpiration] ||
        DEFAULT_REFRESH_TOKEN_EXPIRATION) as StringValue
    )

    this.logger.log(
      `[init] Refresh token expiration: ${this.refreshTokenExpiration}ms`
    )
  }

  async validateAccessToken(token: string): Promise<string> {
    const payload = await this.jwtService.verifyAsync(token)
    return payload.sub
  }

  generateAccessToken(userId: string): AccessToken {
    const token = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.accessTokenExpiration }
    )
    return new AccessToken(token, this.accessTokenExpiration, userId)
  }

  generateRefreshToken(userId: string): RefreshToken {
    const token = this.jwtService.sign(
      { sub: userId },
      { expiresIn: this.refreshTokenExpiration }
    )
    return new RefreshToken(token, this.refreshTokenExpiration, userId)
  }

  async storeRefreshToken(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken.getToken(),
        userId: refreshToken.getUserId(),
        expires: new Date(Date.now() + refreshToken.getExpiresIn()),
      },
    })
  }

  async validateRefreshToken(token: string): Promise<string | null> {
    try {
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          token,
          expires: {
            gt: new Date(),
          },
        },
      })

      if (!storedToken) {
        return null
      }

      return storedToken.userId
    } catch (error) {
      return null
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        token,
      },
    })
  }

  async deleteAllRefreshTokens(
    userId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    await (tx || this.prisma).refreshToken.deleteMany({
      where: { userId },
    })
  }
}
