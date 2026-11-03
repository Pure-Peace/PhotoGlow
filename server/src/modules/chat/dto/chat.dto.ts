import { ApiProperty } from '@nestjs/swagger'
import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsArray,
} from 'class-validator'

export class CreateConversationDto {
  @ApiProperty({
    description: 'ID of the user to start a conversation with',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  participantId!: string

  @ApiProperty({
    description: 'Initial message content to send in the conversation',
    example: 'Hey, how are you?',
    required: false,
  })
  @IsString()
  @IsOptional()
  initialMessage?: string
}

export class SendMessageDto {
  @ApiProperty({
    description: 'Content of the message to be sent',
    example: 'Hello! Nice to meet you.',
    minLength: 1,
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  content!: string
}

export class MarkMessagesReadDto {
  @ApiProperty({
    description: 'Array of message IDs to mark as read',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43f7-9abc-123456789012',
    ],
    type: [String],
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  messageIds!: string[]
}
