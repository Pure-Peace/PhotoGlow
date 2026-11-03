import {
  Controller,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Delete,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import {
  CurrentUser,
  OptionalUser,
} from '@/common/decorators/current-user.decorator'
import { CreatePostDto, UpdatePostDto } from '@/modules/posts/dto/post.dto'

import { PostsService } from './posts.service'

@ApiTags('Posts')
@ApiBearerAuth()
@UseGuards(OptionalJwtAuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Get posts list',
    description: 'Retrieve a list of posts with optional filtering, pagination, and user-specific content',
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    type: Number,
    description: 'Number of posts to return (default: 18)',
    example: 18 
  })
  @ApiQuery({ 
    name: 'offset', 
    required: false, 
    type: Number,
    description: 'Number of posts to skip (default: 0)',
    example: 0 
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['following'],
    description: 'Filter posts by type - "following" shows posts from followed users only',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order for posts (default: desc)',
  })
  @ApiQuery({
    name: 'username',
    required: false,
    type: String,
    description: 'Get posts for a specific user',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['posts', 'saved', 'liked', 'all'],
    description: 'Type of posts to retrieve when username is specified (default: all)',
  })
  @ApiOkResponse({ 
    description: 'Posts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
          title: { type: 'string', example: 'Beautiful sunset' },
          content: { type: 'string', example: 'Captured this amazing sunset today!' },
          type: { type: 'string', enum: ['PHOTO', 'VIDEO'], example: 'PHOTO' },
          visibility: { type: 'string', enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'], example: 'PUBLIC' },
          cover: { type: 'string', example: 'https://example.com/image.jpg' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
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
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  async getPosts(
    @OptionalUser() user?: { id: string },
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('filter') filter?: 'following',
    @Query('order') order?: 'asc' | 'desc',
    @Query('username') username?: string,
    @Query('type') type?: 'posts' | 'saved' | 'liked' | 'all'
  ) {
    return this.postsService.getPosts(
      user?.id,
      filter,
      limit ? parseInt(limit.toString()) : 18,
      offset ? parseInt(offset.toString()) : 0,
      order || 'desc',
      username,
      type || 'all'
    )
  }

  @Get(':postId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ 
    summary: 'Get post by ID',
    description: 'Retrieve detailed information about a specific post'
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'Unique identifier of the post',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Post retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        content: { type: 'string' },
        type: { type: 'string', enum: ['PHOTO', 'VIDEO'] },
        visibility: { type: 'string', enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'] },
        cover: { type: 'string' },
        author: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
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
        comments: {
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
                  avatar: { type: 'string' }
                }
              },
              createdAt: { type: 'string', format: 'date-time' }
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
        },
        location: {
          type: 'object',
          nullable: true,
          properties: {
            name: { type: 'string' },
            city: { type: 'string' },
            country: { type: 'string' }
          }
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async getPost(
    @Param('postId') postId: string,
    @OptionalUser() user?: { id: string }
  ) {
    return this.postsService.getPost(postId, user?.id)
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Create a new post',
    description: 'Create a new post with media, location, topics, and tags'
  })
  @ApiBody({
    type: CreatePostDto,
    description: 'Post creation data',
    examples: {
      photoPost: {
        value: {
          title: 'Beautiful sunset',
          content: 'Captured this amazing sunset today! #nature #photography',
          visibility: 'PUBLIC',
          type: 'PHOTO',
          media: [
            {
              url: 'https://example.com/sunset.jpg',
              type: 'IMAGE',
              alt: 'Sunset over the ocean',
              order: 0
            }
          ],
          locationId: '123e4567-e89b-12d3-a456-426614174000',
          topicIds: ['nature-topic-id', 'photography-topic-id'],
          tagIds: ['sunset-tag-id', 'landscape-tag-id']
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'Post created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { 
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
          description: 'The ID of the created post'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async createPost(
    @CurrentUser() user: { id: string },
    @Body() createPostDto: CreatePostDto
  ) {
    const postId = await this.postsService.createPost(user.id, createPostDto)
    return { id: postId }
  }

  @Put(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Update a post',
    description: 'Update an existing post\'s content, media, location, topics, or tags'
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'ID of the post to update',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({
    type: UpdatePostDto,
    description: 'Post update data',
    examples: {
      updateExample: {
        value: {
          title: 'Updated sunset photo',
          content: 'Updated description of the sunset #nature',
          visibility: 'PUBLIC',
          media: [
            {
              url: 'https://example.com/sunset-edited.jpg',
              type: 'IMAGE',
              alt: 'Edited sunset over the ocean',
              order: 0
            }
          ],
          topicIds: ['nature-topic-id'],
          tagIds: ['sunset-tag-id']
        }
      }
    }
  })
  @ApiOkResponse({ 
    description: 'Post updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { 
          type: 'boolean',
          example: true,
          description: 'Indicates if the update was successful'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized to update this post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async updatePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const success = await this.postsService.updatePost(
      user.id,
      postId,
      updatePostDto
    )
    return { success }
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: 'Delete a post',
    description: 'Permanently delete a post and all associated media'
  })
  @ApiParam({ 
    name: 'postId', 
    description: 'ID of the post to delete',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiOkResponse({ 
    description: 'Post deleted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { 
          type: 'boolean',
          example: true,
          description: 'Indicates if the deletion was successful'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authorized to delete this post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async deletePost(
    @CurrentUser() user: { id: string },
    @Param('postId') postId: string
  ) {
    const success = await this.postsService.deletePost(user.id, postId)
    return { success }
  }
}
