import { Controller, UseGuards, Body, Put, Post } from '@nestjs/common'
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import {
  UpdatePasswordDto,
  UpdateEmailDto,
  ResetPasswordDto,
} from '@/modules/settings/dto/settings.dto'

import { SettingsService } from './settings.service'

@ApiTags('settings')
@UseGuards(OptionalJwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user password',
    description:
      'Updates the password for the authenticated user. Requires current password verification.',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the password was updated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or user is not authenticated',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updatePassword(
    @CurrentUser() user: { id: string },
    @Body() updatePasswordDto: UpdatePasswordDto
  ) {
    const success = await this.settingsService.updateUserPassword(
      user.id,
      updatePasswordDto
    )
    return { success }
  }

  @Post('password/reset')
  @ApiOperation({ summary: 'Reset user password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ success: boolean }> {
    await this.settingsService.resetPassword(resetPasswordDto)
    return { success: true }
  }

  @Put('email')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update user email',
    description:
      'Updates the email address for the authenticated user. Requires current password and email verification code.',
  })
  @ApiBody({ type: UpdateEmailDto })
  @ApiResponse({
    status: 200,
    description: 'Email updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the email was updated successfully',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or user is not authenticated',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid verification code or email format',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 409,
    description: 'Email already in use by another user',
  })
  async updateEmail(
    @CurrentUser() user: { id: string },
    @Body() updateEmailDto: UpdateEmailDto
  ) {
    const success = await this.settingsService.updateUserEmail(
      user.id,
      updateEmailDto
    )
    return { success }
  }
}
