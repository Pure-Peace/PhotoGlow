import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ChatService } from './chat.service'
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import {
  CreateConversationDto,
  SendMessageDto,
  MarkMessagesReadDto,
} from '@/modules/chat/dto/chat.dto'

@ApiTags('Chat')
@UseGuards(OptionalJwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user conversations',
    description:
      'Retrieves all conversations for the authenticated user. Can optionally get a specific conversation or prepare a new one with a target user.',
  })
  @ApiQuery({
    name: 'targetUserId',
    required: false,
    description: 'Target user ID to get or prepare conversation with',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({
    name: 'conversationId',
    required: false,
    description: 'Conversation ID to get full details',
    type: String,
    example: '987fcdeb-51a2-43f7-9abc-123456789012',
  })
  @ApiQuery({
    name: 'includeMessages',
    required: false,
    type: Boolean,
    description: 'Whether to include messages in the response',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
    schema: {
      properties: {
        conversations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              participants: { type: 'array', items: { type: 'object' } },
              lastMessage: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  createdAt: { type: 'string' },
                  senderId: { type: 'string' },
                },
              },
              unreadCount: { type: 'number' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
        activeConversation: {
          type: 'object',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getUserConversations(
    @CurrentUser() user: { id: string },
    @Query('targetUserId') targetUserId?: string,
    @Query('conversationId') conversationId?: string,
    @Query('includeMessages') includeMessages?: boolean
  ) {
    return this.chatService.getUserConversations(user.id, {
      targetUserId,
      conversationId,
      includeMessages,
    })
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a new conversation',
    description:
      'Creates a new conversation with another user and optionally sends an initial message.',
  })
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({
    status: 201,
    description: 'Conversation created successfully',
    schema: {
      properties: {
        conversationId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Target user not found' })
  async createConversation(
    @CurrentUser() user: { id: string },
    @Body() createConversationDto: CreateConversationDto
  ) {
    const conversationId = await this.chatService.createConversation(
      user.id,
      createConversationDto.participantId,
      createConversationDto.initialMessage
    )
    return { conversationId }
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Send a message in a conversation',
    description:
      'Sends a new message in an existing conversation. The sender must be a participant in the conversation.',
  })
  @ApiParam({
    name: 'id',
    description: 'Conversation ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    schema: {
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        sender: { type: 'object' },
        conversationId: { type: 'string' },
        read: { type: 'boolean' },
        createdAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Conversation not found' })
  async sendMessage(
    @CurrentUser() user: { id: string },
    @Param('id') conversationId: string,
    @Body() sendMessageDto: SendMessageDto
  ) {
    const message = await this.chatService.sendMessage(
      user.id,
      conversationId,
      sendMessageDto.content
    )
    return message
  }

  @Post('messages/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mark messages as read',
    description:
      'Marks multiple messages as read for the current user. Only messages where the user is a participant can be marked as read.',
  })
  @ApiBody({ type: MarkMessagesReadDto })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
    schema: {
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async markMessagesAsRead(
    @CurrentUser() user: { id: string },
    @Body() markReadDto: MarkMessagesReadDto
  ) {
    const success = await this.chatService.markMessagesAsRead(
      user.id,
      markReadDto.messageIds
    )
    return { success }
  }
}
