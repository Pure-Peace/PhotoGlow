import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiTags, ApiQuery, ApiResponse, ApiHeader, ApiOperation } from '@nestjs/swagger'

import { OptionalJwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { OptionalUser } from '@/common/decorators/current-user.decorator'

import { MentionsService } from './mentions.service'

@ApiTags('Mention Suggestions')
@UseGuards(OptionalJwtAuthGuard)
@Controller('mentions')
export class MentionsController {
  constructor(private readonly mentionsService: MentionsService) {}

  @Get('users')
  @ApiOperation({
    summary: 'Search users for mentions',
    description: 'Returns a list of users matching the search query for mention suggestions. Limited to 10 results.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query to filter users by username or display name',
    type: String,
  })
  @ApiHeader({
    name: 'Authorization',
    required: false,
    description: 'Bearer token for authentication. If provided, will exclude the authenticated user from results.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of users matching the query',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Username of the user' },
          id: { type: 'string', description: 'Unique identifier of the user' },
          displayName: { type: 'string', description: 'Display name or username of the user' },
          avatar: { type: 'string', nullable: true, description: 'URL of the user\'s avatar' },
        },
      },
    },
  })
  async searchUsers(
    @Query('query') query: string = '',
    @OptionalUser() user?: { id: string }
  ) {
    return this.mentionsService.searchUsers(query, user?.id)
  }

  @Get('topics')
  @ApiOperation({
    summary: 'Search topics for mentions',
    description: 'Returns a list of topics matching the search query for mention suggestions. Limited to 10 results.',
  })
  @ApiQuery({
    name: 'query',
    required: false,
    description: 'Search query to filter topics by name',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of topics matching the query',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string', description: 'Name of the topic' },
          id: { type: 'string', description: 'Unique identifier of the topic' },
          description: { type: 'string', nullable: true, description: 'Description of the topic' },
        },
      },
    },
  })
  async searchTopics(@Query('query') query: string = '') {
    return this.mentionsService.searchTopics(query)
  }
}
