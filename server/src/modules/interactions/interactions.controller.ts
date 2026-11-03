import { Controller, UseGuards, Post, Body, Param } from '@nestjs/common'
import { InteractionsService } from './interactions.service'
import { ApiTags, ApiResponse, ApiOperation, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { LikeDto, SaveDto } from '@/modules/interactions/dto/interaction.dto'

@ApiTags('Interactions')
@ApiBearerAuth()
@UseGuards(OptionalJwtAuthGuard)
@Controller('actions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post('likes/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Like or unlike a comment',
    description: 'Toggle like status on a comment. Creates a notification for the comment author when liked.'
  })
  @ApiParam({ 
    name: 'commentId', 
    description: 'Unique identifier of the comment',
    type: 'string',
    example: 'comment-123'
  })
  @ApiBody({
    type: LikeDto,
    description: 'Like status to set',
    examples: {
      like: {
        value: { liked: true },
        summary: 'Like the comment'
      },
      unlike: {
        value: { liked: false },
        summary: 'Unlike the comment'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Comment liked/unliked successfully',
    schema: {
      type: 'object',
      properties: {
        liked: {
          type: 'boolean',
          description: 'Current like status',
          example: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Not authenticated - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'Comment not found - The specified comment ID does not exist' })
  async likeComment(
    @CurrentUser() user: { id: string },
    @Param('commentId') commentId: string,
    @Body() likeDto: LikeDto
  ) {
    const liked = await this.interactionsService.likeComment(
      user.id,
      commentId,
      likeDto.liked
    )
    return { liked }
  }

  @Post('likes/posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Like or unlike a post',
    description: 'Toggle like status on a post. Creates a notification for the post author when liked.'
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'Unique identifier of the post',
    type: 'string',
    example: 'post-123'
  })
  @ApiBody({
    type: LikeDto,
    description: 'Like status to set',
    examples: {
      like: {
        value: { liked: true },
        summary: 'Like the post'
      },
      unlike: {
        value: { liked: false },
        summary: 'Unlike the post'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Post liked/unliked successfully',
    schema: {
      type: 'object',
      properties: {
        liked: {
          type: 'boolean',
          description: 'Current like status',
          example: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Not authenticated - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'Post not found - The specified post ID does not exist' })
  async likePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
    @Body() likeDto: LikeDto
  ) {
    const liked = await this.interactionsService.likePost(
      user.id,
      postId,
      likeDto.liked
    )
    return { liked }
  }

  @Post('saves/posts/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Save or unsave a post',
    description: 'Toggle save/bookmark status on a post. Saved posts can be accessed later from the user\'s profile.'
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'Unique identifier of the post',
    type: 'string',
    example: 'post-123'
  })
  @ApiBody({
    type: SaveDto,
    description: 'Save status to set',
    examples: {
      save: {
        value: { saved: true },
        summary: 'Save the post'
      },
      unsave: {
        value: { saved: false },
        summary: 'Unsave the post'
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Post saved/unsaved successfully',
    schema: {
      type: 'object',
      properties: {
        saved: {
          type: 'boolean',
          description: 'Current save status',
          example: true
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Not authenticated - Valid JWT token is required' })
  @ApiResponse({ status: 404, description: 'Post not found - The specified post ID does not exist' })
  async savePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
    @Body() saveDto: SaveDto
  ) {
    const saved = await this.interactionsService.savePost(
      user.id,
      postId,
      saveDto.saved
    )
    return { saved }
  }
}
