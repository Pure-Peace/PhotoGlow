import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

import { LoginDto, AuthDto, RegisterDto } from '@/modules/auth/dto/auth.dto'

import { sanitizeUser } from '@/common/utils/common'
import { RefreshToken } from '@/common/utils/token'
import type { SanitizedUser } from '@photoglow/shared/types/user'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { EmailService } from '@/infra/email/email.service'
import { TokenService } from '@/infra/token/token.service'
import { VerificationService } from '@/infra/verification/verification.service'
import type { VerificationCodeType } from '@photoglow/shared/types/verification'
import { OauthService } from '@/infra/oauth/oauth.service'
import { generateUsername } from 'unique-username-generator'
import { OAuthProvider, UserStatus } from '@photoglow/database'
import ms from 'ms'
import { usernameRegex } from '@photoglow/shared/regex'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly verificationService: VerificationService,
    private readonly emailService: EmailService,
    private readonly oauthService: OauthService
  ) {}

  async getAuth(userId: string): Promise<SanitizedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    return sanitizeUser(user)
  }

  async getOauthAccounts(userId: string): Promise<Record<string, string>> {
    const oauthAccounts = await this.prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        provider: true,
        email: true,
      },
    })

    const providerMap: Record<string, string> = {}

    for (const account of oauthAccounts) {
      if (account.email) {
        providerMap[account.provider.toLowerCase()] = account.email
      }
    }

    return providerMap
  }

  async login(loginDto: LoginDto): Promise<[AuthDto, RefreshToken]> {
    const { email, password } = loginDto

    const user = await this.prisma.user.findUnique({
      where: { email, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await Bun.password.verify(password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = this.tokenService.generateAccessToken(user.id)
    const refreshToken = this.tokenService.generateRefreshToken(user.id)

    // Store refresh token in database
    await this.tokenService.storeRefreshToken(refreshToken)

    const userData = sanitizeUser(user)

    return [
      {
        accessToken: accessToken.getToken(),
        user: userData,
      },
      refreshToken,
    ]
  }

  async register(registerDto: RegisterDto): Promise<[AuthDto, RefreshToken]> {
    const { email, password, username, verification } = registerDto

    // Check if verification code is valid
    const isValid = await this.verificationService.validateVerificationCode(
      email,
      verification,
      'signup'
    )

    if (!isValid) {
      throw new BadRequestException('Invalid verification code')
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      throw new ConflictException(
        existingUser.email === email
          ? 'Email already in use'
          : 'Username already in use'
      )
    }

    // Hash password
    const hashedPassword = await Bun.password.hash(password)

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName: username,
      },
    })

    // Delete verification code
    await this.verificationService.deleteVerificationCode(email, 'signup')

    const accessToken = this.tokenService.generateAccessToken(user.id)
    const refreshToken = this.tokenService.generateRefreshToken(user.id)

    // Store refresh token
    await this.tokenService.storeRefreshToken(refreshToken)

    const userData = sanitizeUser(user)

    return [
      {
        accessToken: accessToken.getToken(),
        user: userData,
      },
      refreshToken,
    ]
  }

  async logout(refreshToken: string): Promise<boolean> {
    await this.tokenService.deleteRefreshToken(refreshToken)
    return true
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const userId = await this.tokenService.validateRefreshToken(refreshToken)

    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token')
    }

    return this.tokenService.generateAccessToken(userId).getToken()
  }

  async sendEmailVerificationCode(
    email: string,
    type: VerificationCodeType
  ): Promise<boolean> {
    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    try {
      // Store the code in Redis with 10 minutes expiration
      await this.verificationService.setVerificationCode(email, code, type)

      // Send the verification code via email
      await this.emailService.sendVerificationCode(email, code, type)

      return true
    } catch (error) {
      this.logger.error(
        `Failed to send verification code to ${email}:`,
        error instanceof Error ? error.stack : String(error)
      )
      return false
    }
  }

  async handleGoogleOAuthCallback(
    code: string,
    userId?: string
  ): Promise<[AuthDto, RefreshToken]> {
    // Get tokens from Google
    const client = this.oauthService.newGoogleOAuth2Client()
    let { tokens } = await client.getToken(code)

    if (!tokens.access_token) {
      throw new UnauthorizedException('Failed to authenticate with Google')
    }

    client.setCredentials(tokens)
    const googleUserInfo = await client.getTokenInfo(tokens.access_token)

    if (!googleUserInfo.email_verified || !googleUserInfo.email) {
      throw new UnauthorizedException('Email not verified')
    }

    let oauthAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_email: {
          provider: OAuthProvider.GOOGLE,
          email: googleUserInfo.email,
        },
      },
    })

    let user: any = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: userId }, { email: googleUserInfo.email }],
        status: UserStatus.ACTIVE,
      },
    })

    if (!oauthAccount) {
      const username = await this.generateUniqueUsername()
      await this.prisma.$transaction(async (tx) => {
        if (!user) {
          // Create new user
          user = await tx.user.create({
            data: {
              email: googleUserInfo.email!,
              username,
              displayName: username,
              emailVerified: new Date(),
              status: UserStatus.ACTIVE,
              // Set a random password for OAuth users
              password: await Bun.password.hash(Math.random().toString(36)),
            },
          })
        }

        oauthAccount = await tx.oAuthAccount.create({
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiry: new Date(tokens.expiry_date || ms('1h')),
            provider: OAuthProvider.GOOGLE,
            email: googleUserInfo.email,
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        })
      })
    } else if (!user) {
      user = await this.prisma.user.findUnique({
        where: { id: oauthAccount.userId, status: UserStatus.ACTIVE },
      })
    }

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(user.id)
    const refreshToken = this.tokenService.generateRefreshToken(user.id)

    // Store refresh token
    await this.tokenService.storeRefreshToken(refreshToken)

    const userData = sanitizeUser(user)

    return [
      {
        accessToken: accessToken.getToken(),
        user: userData,
      },
      refreshToken,
    ]
  }

  async deleteGoogleOAuth(userId: string): Promise<void> {
    await this.prisma.oAuthAccount.deleteMany({
      where: { userId, provider: OAuthProvider.GOOGLE },
    })
  }

  private async generateUniqueUsername(): Promise<string> {
    const username = generateUsername('_', 3, 18, 'user')
    if (!usernameRegex.test(username)) {
      return await this.generateUniqueUsername()
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    })

    if (existingUser) {
      return await this.generateUniqueUsername()
    }

    return username
  }
}
