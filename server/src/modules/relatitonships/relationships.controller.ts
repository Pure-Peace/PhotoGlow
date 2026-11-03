import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'

import { RelationshipsService } from './relationships.service'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import {
  CurrentUser,
  OptionalUser,
} from '@/common/decorators/current-user.decorator'
import { FollowDto } from '@/modules/interactions/dto/interaction.dto'

@ApiTags('Relationships')
@UseGuards(OptionalJwtAuthGuard)
@Controller('social')
export class RelationshipsController {
  constructor(private readonly relationshipsService: RelationshipsService) {}

  @Post('follow/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Follow or unfollow a user',
    description: 'Follow or unfollow a user by their user ID. Returns the new following status.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to follow/unfollow',
    type: 'string',
    required: true,
  })
  @ApiBody({
    type: FollowDto,
    description: 'The follow status to set',
    examples: {
      follow: {
        value: { following: true },
        summary: 'Follow user',
      },
      unfollow: {
        value: { following: false },
        summary: 'Unfollow user',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User followed/unfollowed successfully',
    schema: {
      type: 'object',
      properties: {
        following: {
          type: 'boolean',
          description: 'The new following status',
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  @ApiResponse({ status: 400, description: 'Cannot follow yourself' })
  async followUser(
    @CurrentUser() user: { id: string },
    @Param('userId') targetUserId: string,
    @Body() followDto: FollowDto
  ) {
    const following = await this.relationshipsService.followUser(
      user.id,
      targetUserId,
      followDto.following
    )
    return { following }
  }

  @Get('followers/:username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get user followers',
    description: 'Get a list of users who follow the specified user. If authenticated, includes relationship status.',
  })
  @ApiParam({
    name: 'username',
    description: 'The username of the user whose followers to retrieve',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Followers retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123' },
          username: { type: 'string', example: 'john_doe' },
          displayName: { type: 'string', example: 'John Doe' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          relationship: {
            type: 'object',
            properties: {
              isFollowing: { type: 'boolean' },
              isFollowedBy: { type: 'boolean' },
              isBlocked: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFollowers(
    @Param('username') username: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.relationshipsService.getUserFollowers(username, user?.id)
  }

  @Get('following/:username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get users followed by a user',
    description: 'Get a list of users that the specified user follows. If authenticated, includes relationship status.',
  })
  @ApiParam({
    name: 'username',
    description: 'The username of the user whose following list to retrieve',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Following list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123' },
          username: { type: 'string', example: 'john_doe' },
          displayName: { type: 'string', example: 'John Doe' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
          relationship: {
            type: 'object',
            properties: {
              isFollowing: { type: 'boolean' },
              isFollowedBy: { type: 'boolean' },
              isBlocked: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserFollowing(
    @Param('username') username: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.relationshipsService.getUserFollowing(username, user?.id)
  }

  @Post('block/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Block a user',
    description: 'Block a user by their user ID. This will also automatically unfollow the user in both directions.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to block',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User blocked successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  @ApiResponse({ status: 400, description: 'Cannot block yourself' })
  async blockUser(
    @CurrentUser() user: { id: string },
    @Param('userId') targetUserId: string
  ) {
    const success = await this.relationshipsService.blockUser(
      user.id,
      targetUserId
    )
    return { success }
  }

  @Post('unblock/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Unblock a user',
    description: 'Unblock a previously blocked user by their user ID.',
  })
  @ApiParam({
    name: 'userId',
    description: 'The ID of the user to unblock',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User unblocked successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  async unblockUser(
    @CurrentUser() user: { id: string },
    @Param('userId') targetUserId: string
  ) {
    const success = await this.relationshipsService.unblockUser(
      user.id,
      targetUserId
    )
    return { success }
  }

  @Get('me/blocked')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get blocked users',
    description: 'Get a list of users that the current authenticated user has blocked.',
  })
  @ApiResponse({
    status: 200,
    description: 'Blocked users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'user-123' },
          username: { type: 'string', example: 'john_doe' },
          displayName: { type: 'string', example: 'John Doe' },
          avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'User not authenticated' })
  async getBlockedUsers(@CurrentUser() user: { id: string }) {
    return this.relationshipsService.getBlockedUsers(user.id)
  }
}
