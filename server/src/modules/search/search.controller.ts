import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'

import { SearchService } from './search.service'

import { OptionalJwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { OptionalUser } from '@/common/decorators/current-user.decorator'

@ApiTags('Search')
@UseGuards(OptionalJwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Search for posts, users and topics',
    description: 'Search across multiple entities including posts, users and topics. Returns paginated results for each entity type.'
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query string to match against posts, users and topics',
    required: true,
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        posts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              title: { type: 'string' },
              content: { type: 'string' },
              visibility: { type: 'string' },
              cover: { type: 'string', nullable: true },
              likesCount: { type: 'number' },
              savesCount: { type: 'number' },
              commentsCount: { type: 'number' },
              score: { type: 'number' },
              author: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  username: { type: 'string' },
                  displayName: { type: 'string' },
                  avatar: { type: 'string' },
                  relationship: {
                    type: 'object',
                    properties: {
                      isFollowing: { type: 'boolean' },
                      isFollowedBy: { type: 'boolean' },
                      isBlocked: { type: 'boolean' }
                    }
                  }
                }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              media: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    type: { type: 'string' },
                    alt: { type: 'string' }
                  }
                }
              },
              interactions: {
                type: 'object',
                properties: {
                  likes: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      hasLiked: { type: 'boolean' }
                    }
                  },
                  saves: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      hasSaved: { type: 'boolean' }
                    }
                  },
                  comments: {
                    type: 'object',
                    properties: {
                      count: { type: 'number' },
                      hasCommented: { type: 'boolean' }
                    }
                  }
                }
              }
            }
          }
        },
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              username: { type: 'string' },
              displayName: { type: 'string' },
              avatar: { type: 'string' },
              bio: { type: 'string' },
              followersCount: { type: 'number' },
              followingCount: { type: 'number' },
              relationship: {
                type: 'object',
                properties: {
                  isFollowing: { type: 'boolean' },
                  isFollowedBy: { type: 'boolean' },
                  isBlocked: { type: 'boolean' }
                }
              }
            }
          }
        },
        topics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              postCount: { type: 'number' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query provided'
  })
  async search(
    @Query('q') query: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.searchService.search(query, user?.id)
  }
}
