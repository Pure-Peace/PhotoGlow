import {
  Controller,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  UploadedFile,
  UseInterceptors,
  Delete,
} from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import {
  CurrentUser,
  OptionalUser,
} from '@/common/decorators/current-user.decorator'
import { multerConfig } from '@/common/config/multer.config'
import { UpdateUserDto, SanitizedUserDto } from '@/modules/user/dto/user.dto'

import { UserService } from './user.service'

@ApiTags('User')
@UseGuards(OptionalJwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':username/profile')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get user profile by username',
    description:
      'Retrieves detailed user profile information including stats and relationship status if authenticated',
  })
  @ApiParam({
    name: 'username',
    description: 'Username of the user whose profile is being requested',
    example: 'john_doe',
    required: true,
  })
  @ApiOkResponse({
    description: 'User profile data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            displayName: { type: 'string' },
            bio: { type: 'string' },
            avatarUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
            relationship: {
              type: 'object',
              properties: {
                isFollowing: { type: 'boolean', example: false },
                isFollowedBy: { type: 'boolean', example: false },
                isBlocked: { type: 'boolean', example: false },
              },
            },
          },
        },
        stats: {
          type: 'object',
          properties: {
            followers: { type: 'number', example: 100 },
            following: { type: 'number', example: 50 },
            posts: { type: 'number', example: 25 },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProfile(
    @Param('username') username: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.userService.getUserByUsername(username, user?.id)
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update user profile',
    description:
      "Update authenticated user's profile information including avatar",
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'New username',
          example: 'john_doe',
          minLength: 1,
          maxLength: 30,
        },
        displayName: {
          type: 'string',
          description: 'New display name',
          example: 'John Doe',
          minLength: 1,
          maxLength: 50,
        },
        bio: {
          type: 'string',
          description: 'User biography',
          example: 'Hello, I am John!',
          minLength: 1,
          maxLength: 500,
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'User avatar image file',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Profile updated successfully',
    type: SanitizedUserDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 409, description: 'Username already in use' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File
  ) {
    const updatedUser = await this.userService.updateUserProfile(
      user.id,
      updateUserDto,
      avatar
    )
    return { updatedUser }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Permanently delete the authenticated user&apos;s account',
  })
  @ApiOkResponse({
    description: 'User account deleted successfully',
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async deleteUser(@CurrentUser() user: { id: string }) {
    return this.userService.deleteUser(user.id)
  }
}
