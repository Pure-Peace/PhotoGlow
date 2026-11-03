import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { MarkNotificationsAsReadDto } from '@/modules/notifications/dto/notifications.dto'

import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@UseGuards(OptionalJwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get notifications for the current user',
    description:
      'Retrieves all notifications for the authenticated user, including unread chat count',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of notifications to return (default: 10)',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of notifications to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: {
                type: 'string',
                enum: ['like', 'comment', 'follow', 'mention', 'reply', 'chat'],
              },
              read: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              actor: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
              postId: { type: 'string', nullable: true },
              commentId: { type: 'string', nullable: true },
              targetType: {
                type: 'string',
                enum: ['post', 'comment'],
                nullable: true,
              },
              message: { type: 'string' },
              post: {
                type: 'object',
                nullable: true,
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  cover: { type: 'string' },
                  preview: { type: 'string' },
                },
              },
              commentContent: { type: 'string', nullable: true },
            },
          },
        },
        unreadChatCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getNotifications(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.notificationsService.getNotifications(
      user.id,
      limit ? parseInt(limit.toString()) : 10,
      offset ? parseInt(offset.toString()) : 0
    )
  }

  @Get('count')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get unread notification and chat count for the current user',
    description:
      'Retrieves the number of unread notifications and chat count for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Unread notification and chat count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        unreadNotificationCount: { type: 'number' },
        unreadChatCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getUnreadNotificationAndChatCount(@CurrentUser() user: { id: string }) {
    return this.notificationsService.getUnreadNotificationAndChatCount(user.id)
  }

  @Post('read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark notifications as read',
    description:
      'Marks multiple notifications as read for the authenticated user',
  })
  @ApiBody({ type: MarkNotificationsAsReadDto })
  @ApiResponse({
    status: 200,
    description: 'Notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async markNotificationsAsRead(
    @CurrentUser() user: { id: string },
    @Body() markReadDto: MarkNotificationsAsReadDto
  ) {
    const success = await this.notificationsService.markNotificationsAsRead(
      user.id,
      markReadDto.notificationIds
    )
    return { success }
  }

  @Delete(':notificationId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a notification',
    description: 'Deletes a specific notification for the authenticated user',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'The ID of the notification to delete',
    type: 'string',
    example: 'notification-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @CurrentUser() user: { id: string },
    @Param('notificationId') notificationId: string
  ) {
    const success = await this.notificationsService.deleteNotification(
      user.id,
      notificationId
    )
    return { success }
  }
}
