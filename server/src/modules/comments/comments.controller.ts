import {
  Controller,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import {
  CurrentUser,
  OptionalUser,
} from '@/common/decorators/current-user.decorator'
import type { CreateCommentDto } from '@/modules/comments/dto/comment.dto'

@ApiTags('Comments')
@UseGuards(OptionalJwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/posts/:postId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get comments for a post',
    description: 'Retrieve comments for a specific post with optional pagination and filtering',
  })
  @ApiParam({
    name: 'postId',
    description: 'The unique identifier of the post',
    type: 'string',
    required: true,
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Parent comment ID to get replies. If not provided, returns top-level comments',
    type: 'string',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of comments to return (default: 10)',
    type: 'number',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of comments to skip for pagination (default: 0)',
    type: 'number',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          content: { type: 'string' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              displayName: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          likes: { type: 'number' },
          repliesCount: { type: 'number' },
          hasLiked: { type: 'boolean' },
          parentId: { type: 'string', nullable: true },
          replyTo: { type: 'string', nullable: true },
          level: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async getPostComments(
    @Param('postId') postId: string,
    @Query('parentId') parentId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.commentsService.getPostComments(
      postId,
      user?.id,
      parentId,
      limit ? parseInt(limit) : undefined,
      offset ? parseInt(offset) : undefined
    )
  }

  @Post('posts/:postId/create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Create a comment on a post',
    description: 'Create a new comment or reply to an existing comment on a post',
  })
  @ApiParam({
    name: 'postId',
    description: 'The unique identifier of the post to comment on',
    type: 'string',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['content'],
      properties: {
        content: { type: 'string', description: 'The content of the comment' },
        parentId: {
          type: 'string',
          description: 'Optional parent comment ID for replies',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Post or parent comment not found' })
  @ApiResponse({ status: 400, description: 'Invalid comment data or nesting level exceeded' })
  async createComment(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const success = await this.commentsService.createComment(
      user.id,
      postId,
      createCommentDto
    )
    return { success }
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Delete a comment',
    description: 'Delete a comment. Only the comment author can delete their own comments',
  })
  @ApiParam({
    name: 'commentId',
    description: 'The unique identifier of the comment to delete',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Comment deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Not authorized to delete this comment',
  })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  async deleteComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string
  ) {
    const success = await this.commentsService.deleteComment(user.id, commentId)
    return { success }
  }
}
