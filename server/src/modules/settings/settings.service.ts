import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'

import {
  UpdatePasswordDto,
  UpdateEmailDto,
  ResetPasswordDto,
} from '@/modules/settings/dto/settings.dto'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { VerificationService } from '@/infra/verification/verification.service'
import { TokenService } from '@/infra/token/token.service'
import { UserStatus } from '@photoglow/database'
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name)

  constructor(
    private prisma: PrismaService,
    private verificationService: VerificationService,
    private tokenService: TokenService
  ) {}

  async updateUserPassword(
    userId: string,
    updateDto: UpdatePasswordDto
  ): Promise<boolean> {
    const { currentPassword, newPassword } = updateDto

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Validate current password
    const isPasswordValid = await Bun.password.verify(
      currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Hash new password
    const hashedPassword = await Bun.password.hash(newPassword)

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return true
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<void> {
    const { email, verification, password } = resetDto

    // Check if verification code is valid
    const isValid = await this.verificationService.validateVerificationCode(
      email,
      verification,
      'reset-password'
    )

    if (!isValid) {
      throw new BadRequestException('Invalid verification code')
    }

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Hash new password
    const hashedPassword = await Bun.password.hash(password)

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Delete verification code
    await this.verificationService.deleteVerificationCode(
      email,
      'reset-password'
    )

    // Delete all refresh tokens for this user
    await this.tokenService.deleteAllRefreshTokens(user.id)
  }

  async updateUserEmail(
    userId: string,
    updateDto: UpdateEmailDto
  ): Promise<boolean> {
    const { currentPassword, verificationCode, newEmail } = updateDto

    // Get user
    const user = await this.prisma.user.findUnique({
      where: { id: userId, status: UserStatus.ACTIVE },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    // Validate current password
    const isPasswordValid = await Bun.password.verify(
      currentPassword,
      user.password
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect')
    }

    // Check if verification code is valid
    const isValid = await this.verificationService.validateVerificationCode(
      user.email,
      verificationCode,
      'change-email'
    )

    if (!isValid) {
      throw new BadRequestException('Invalid verification code')
    }

    // Check if email is already in use
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: newEmail,
        id: { not: userId },
        status: UserStatus.ACTIVE,
      },
    })

    if (existingUser) {
      throw new ConflictException('Email already in use')
    }

    // Update email
    await this.prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    })

    // Delete verification code
    await this.verificationService.deleteVerificationCode(
      newEmail,
      'change-email'
    )

    return true
  }
}
