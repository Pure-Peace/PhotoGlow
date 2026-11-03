import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import {
  ReportPostDto,
  ReportUserDto,
} from '@/modules/moderation/dto/moderation.dto'

import { ModerationService } from './moderation.service'

@ApiTags('Moderation')
@UseGuards(OptionalJwtAuthGuard)
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('report/post')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Report post',
    description: 'Report a post that violates community guidelines or rules',
  })
  @ApiBody({
    type: ReportPostDto,
    description: 'Post report details including post ID and reason',
  })
  @ApiResponse({
    status: 200,
    description: 'Post reported successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the report was submitted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async reportPost(
    @CurrentUser() user: { id: string },
    @Body() reportDto: ReportPostDto
  ) {
    const success = await this.moderationService.reportPost(
      user.id,
      reportDto.postId,
      reportDto.reason
    )
    return { success }
  }

  @Post('report/user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Report user',
    description: 'Report a user that violates community guidelines or rules',
  })
  @ApiBody({
    type: ReportUserDto,
    description: 'User report details including user ID and reason',
  })
  @ApiResponse({
    status: 200,
    description: 'User reported successfully',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
          description: 'Indicates if the report was submitted successfully',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async reportUser(
    @CurrentUser() user: { id: string },
    @Body() reportDto: ReportUserDto
  ) {
    const success = await this.moderationService.reportUser(
      user.id,
      reportDto.userId,
      reportDto.reason
    )
    return { success }
  }
}
