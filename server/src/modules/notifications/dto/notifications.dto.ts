import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import type { NotificationTargetType } from '@photoglow/shared/types/notifications'
import type { NotificationType } from '@photoglow/shared/types/notifications'

export class UpdateNotificationDto {
  @ApiProperty({
    description: 'Whether the notification has been read',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  read?: boolean
}

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Type of notification',
    enum: ['like', 'comment', 'follow', 'mention', 'reply', 'chat'],
    example: 'like',
  })
  @IsEnum(['like', 'comment', 'follow', 'mention', 'reply', 'chat'])
  type!: NotificationType

  @ApiProperty({
    description: 'Notification message',
    example: 'User liked your post',
  })
  @IsString()
  message!: string

  @ApiProperty({
    description: 'ID of the user who will receive the notification',
    example: 'user-123',
  })
  @IsString()
  targetUserId!: string

  @ApiProperty({
    description: 'ID of the related post (if applicable)',
    example: 'post-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  postId?: string

  @ApiProperty({
    description: 'ID of the related comment (if applicable)',
    example: 'comment-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  commentId?: string

  @ApiProperty({
    description: 'Type of the target content',
    enum: ['post', 'comment'],
    required: false,
    example: 'post',
  })
  @IsOptional()
  @IsEnum(['post', 'comment'])
  targetType?: NotificationTargetType
}

export class MarkNotificationsAsReadDto {
  @ApiProperty({
    description: 'Array of notification IDs to mark as read',
    example: ['notification-id-1', 'notification-id-2'],
    type: [String],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  notificationIds!: string[]
}
