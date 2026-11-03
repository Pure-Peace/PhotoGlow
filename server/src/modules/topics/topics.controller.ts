import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

import { OptionalJwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { OptionalUser } from '@/common/decorators/current-user.decorator'

import { TopicsService } from './topics.service'

@ApiTags('Topics')
@UseGuards(OptionalJwtAuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get('popular')
  @ApiOperation({ 
    summary: 'Get popular topics sorted by post count',
    description: 'Retrieves the top 10 most popular topics based on the number of posts.'
  })
  @ApiResponse({
    status: 200,
    description: 'Popular topics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Topic ID' },
          name: { type: 'string', description: 'Topic name' },
          description: { type: 'string', description: 'Topic description' },
          postCount: { type: 'number', description: 'Number of posts in this topic' }
        }
      }
    }
  })
  async getPopularTopics() {
    return this.topicsService.getPopularTopics()
  }

  @Get(':topicName')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get topic information by name',
    description: 'Retrieves detailed information about a specific topic using its name.'
  })
  @ApiParam({ 
    name: 'topicName', 
    description: 'Topic name to search for',
    type: 'string',
    example: 'technology'
  })
  @ApiResponse({
    status: 200,
    description: 'Topic information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Topic ID' },
        name: { type: 'string', description: 'Topic name' },
        description: { type: 'string', description: 'Topic description' },
        postCount: { type: 'number', description: 'Number of posts in this topic' }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Topic not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Topic not found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  async getTopic(
    @Param('topicName') topicName: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.topicsService.getTopic(topicName, user?.id)
  }

  @Get(':topicName/posts')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get posts for a specific topic',
    description: 'Retrieves paginated posts belonging to a specific topic with detailed interaction information.'
  })
  @ApiParam({ 
    name: 'topicName', 
    description: 'Topic name to get posts from',
    type: 'string',
    example: 'technology'
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number,
    description: 'Number of posts to skip (for pagination)',
    example: 0
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Maximum number of posts to return',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'Topic posts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Topic ID' },
            name: { type: 'string', description: 'Topic name' },
            description: { type: 'string', description: 'Topic description' },
            postCount: { type: 'number', description: 'Total number of posts in this topic' }
          }
        },
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Post ID' },
              title: { type: 'string', description: 'Post title' },
              type: { type: 'string', description: 'Post type' },
              visibility: { type: 'string', description: 'Post visibility' },
              cover: { type: 'string', description: 'Post cover image URL' },
              author: { 
                type: 'object',
                description: 'Post author information including relationship with current user'
              },
              createdAt: { type: 'string', format: 'date-time', description: 'Post creation timestamp' },
              updatedAt: { type: 'string', format: 'date-time', description: 'Post last update timestamp' },
              interactions: {
                type: 'object',
                description: 'Post interaction statistics and current user interaction status'
              },
              content: { type: 'string', description: 'Post content' },
              tags: { 
                type: 'array',
                description: 'Post tags',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Topic not found',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Topic not found' },
        statusCode: { type: 'number', example: 404 }
      }
    }
  })
  async getTopicPosts(
    @Param('topicName') topicName: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @OptionalUser() user?: { id: string }
  ) {
    return this.topicsService.getTopicPosts(topicName, user?.id, limit, offset)
  }
}
