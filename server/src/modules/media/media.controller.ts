import {
  Controller,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Post,
  Get,
  HttpStatus,
} from '@nestjs/common'
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiExtraModels,
} from '@nestjs/swagger'
import { FileInterceptor } from '@nestjs/platform-express'

import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { multerConfig } from '@/common/config/multer.config'

import { MediaService } from './media.service'

@ApiTags('Media')
@ApiExtraModels()
@UseGuards(OptionalJwtAuthGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('my/drafts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get user media drafts',
    description: 'Retrieves all pending media drafts for the currently authenticated user.'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Media drafts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'draft-123' },
          userId: { type: 'string', example: 'user-123' },
          status: { type: 'string', example: 'draft' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  async getUserMediaDrafts(@CurrentUser() user: { id: string }) {
    const drafts = await this.mediaService.getUserMediaDrafts(user.id)
    return drafts
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('media', multerConfig))
  @ApiOperation({
    summary: 'Upload media file',
    description: 'Upload a media file (image, video, etc.) to the server. The file will be processed and stored.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['media'],
      properties: {
        media: {
          type: 'string',
          format: 'binary',
          description: 'The media file to upload'
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'media-123' },
        url: { type: 'string', example: 'https://example.com/media/file.jpg' },
        fileName: { type: 'string', example: 'file.jpg' },
        mimeType: { type: 'string', example: 'image/jpeg' },
        size: { type: 'number', example: 1024 },
        userId: { type: 'string', example: 'user-123' },
        createdAt: { type: 'string', format: 'date-time' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file or no file uploaded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'No file uploaded' }
      }
    }
  })
  async uploadMedia(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file uploaded')
    }
    const result = await this.mediaService.uploadMedia(user.id, file)
    return result
  }
}
