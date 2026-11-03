import {
  IsString,
  IsOptional,
  Length,
  IsEnum,
  IsArray,
  IsNumber,
  IsUrl,
  ValidateNested,
  IsDate,
  IsBoolean,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import {
  PostType,
  PostVisibility,
  type MediaType,
} from '@photoglow/shared/types/post'

export class MediaDto {
  @ApiProperty({ description: 'Unique identifier of the media' })
  id?: string

  @ApiProperty({ description: 'URL of the media resource' })
  @IsUrl()
  url!: string

  @ApiProperty({ 
    description: 'Type of media',
    enum: ['image', 'video'],
    example: 'image'
  })
  @IsEnum(['image', 'video'])
  type!: MediaType

  @ApiPropertyOptional({ description: 'Alternative text for the media' })
  @IsOptional()
  @IsString()
  alt?: string
}

export class CreateMediaDto extends MediaDto {
  @ApiPropertyOptional({ 
    description: 'Display order of the media',
    minimum: 0,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order: number = 0

  @ApiPropertyOptional({ description: 'ID of the media draft if created from draft' })
  @IsOptional()
  @IsString()
  draftId?: string
}

export class LocationDto {
  @ApiProperty({ description: 'Unique identifier of the location' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Name of the location' })
  @IsString()
  name!: string

  @ApiProperty({ description: 'City where the location is situated' })
  @IsString()
  city!: string

  @ApiProperty({ description: 'Country where the location is situated' })
  @IsString()
  country!: string
}

export class TopicDto {
  @ApiProperty({ description: 'Unique identifier of the topic' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Name of the topic' })
  @IsString()
  name!: string
}

export class TagDto {
  @ApiProperty({ description: 'Unique identifier of the tag' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Name of the tag' })
  @IsString()
  name!: string

  @ApiProperty({ description: 'Type of the tag' })
  @IsString()
  type!: string
}

export class AuthorDto {
  @ApiProperty({ description: 'Unique identifier of the author' })
  @IsString()
  id!: string

  @ApiProperty({ description: 'Username of the author' })
  @IsString()
  username!: string

  @ApiProperty({ description: 'Display name of the author' })
  @IsOptional()
  displayName: string | null = null

  @ApiProperty({ description: 'Avatar URL of the author' })
  @IsOptional()
  avatar: string | null = null
}

export class PostInteractionsDto {
  @ApiProperty({ description: 'Whether the current user has liked the post' })
  @IsBoolean()
  hasLiked!: boolean

  @ApiProperty({ description: 'Whether the current user has saved the post' })
  @IsBoolean()
  hasSaved!: boolean

  @ApiProperty({ description: 'Whether the current user has commented on the post' })
  @IsBoolean()
  hasCommented!: boolean
}

export class CreatePostDto {
  @ApiProperty({ 
    description: 'Title of the post',
    minLength: 1,
    maxLength: 200,
    example: 'Beautiful sunset at the beach'
  })
  @IsString()
  @Length(1, 200)
  title!: string

  @ApiPropertyOptional({ 
    description: 'Content/description of the post',
    example: 'Captured this amazing sunset today! #nature #photography'
  })
  @IsOptional()
  @IsString()
  content?: string

  @ApiProperty({ 
    description: 'Type of the post',
    enum: PostType,
    default: PostType.PHOTO,
    example: PostType.PHOTO
  })
  @IsEnum(PostType)
  type: PostType = PostType.PHOTO

  @ApiPropertyOptional({ 
    description: 'Cover image URL for the post',
    example: 'https://example.com/cover.jpg'
  })
  @IsOptional()
  @IsString()
  cover?: string

  @ApiProperty({ 
    description: 'Visibility setting for the post',
    enum: PostVisibility,
    default: PostVisibility.PUBLIC,
    example: PostVisibility.PUBLIC
  })
  @IsEnum(PostVisibility)
  visibility: PostVisibility = PostVisibility.PUBLIC

  @ApiPropertyOptional({ 
    description: 'ID of the location where the post was created',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  locationId?: string

  @ApiProperty({ 
    description: 'Array of media items included in the post',
    type: [CreateMediaDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media!: CreateMediaDto[]

  @ApiPropertyOptional({ 
    description: 'Array of topic IDs associated with the post',
    type: [String],
    example: ['nature-topic-id', 'photography-topic-id']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[]

  @ApiPropertyOptional({ 
    description: 'Array of tag IDs associated with the post',
    type: [String],
    example: ['sunset-tag-id', 'landscape-tag-id']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[]
}

export class UpdatePostDto {
  @ApiPropertyOptional({ 
    description: 'Updated title of the post',
    minLength: 1,
    maxLength: 200,
    example: 'Updated: Beautiful sunset at the beach'
  })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string

  @ApiPropertyOptional({ 
    description: 'Updated content/description of the post',
    example: 'Updated description with new #tags'
  })
  @IsOptional()
  @IsString()
  content?: string

  @ApiPropertyOptional({ 
    description: 'Updated type of the post',
    enum: PostType
  })
  @IsOptional()
  @IsEnum(PostType)
  type?: PostType

  @ApiPropertyOptional({ 
    description: 'Updated cover image URL',
    example: 'https://example.com/updated-cover.jpg'
  })
  @IsOptional()
  @IsString()
  cover?: string

  @ApiPropertyOptional({ 
    description: 'Updated visibility setting',
    enum: PostVisibility
  })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility

  @ApiPropertyOptional({ 
    description: 'Updated location ID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @IsString()
  locationId?: string

  @ApiPropertyOptional({ 
    description: 'Updated array of media items',
    type: [CreateMediaDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMediaDto)
  media?: CreateMediaDto[]

  @ApiPropertyOptional({ 
    description: 'Updated array of topic IDs',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  topicIds?: string[]

  @ApiPropertyOptional({ 
    description: 'Updated array of tag IDs',
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[]
}

export class PostResponseDto {
  @ApiProperty({ description: 'Unique identifier of the post' })
  id!: string

  @ApiProperty({ description: 'Title of the post' })
  title!: string

  @ApiPropertyOptional({ description: 'Content/description of the post' })
  content?: string

  @ApiProperty({ 
    description: 'Type of the post',
    enum: PostType
  })
  type!: PostType

  @ApiPropertyOptional({ description: 'Cover image URL' })
  cover?: string

  @ApiProperty({ 
    description: 'Visibility setting of the post',
    enum: PostVisibility
  })
  visibility!: PostVisibility

  @ApiProperty({ 
    description: 'Author information',
    type: AuthorDto
  })
  @ValidateNested()
  @Type(() => AuthorDto)
  author!: AuthorDto

  @ApiProperty({ 
    description: 'Array of media items',
    type: [MediaDto]
  })
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media!: MediaDto[]

  @ApiPropertyOptional({ 
    description: 'Location information',
    type: LocationDto
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto

  @ApiProperty({ description: 'Post score/rating' })
  @IsNumber()
  score!: number

  @ApiProperty({ description: 'Number of comments on the post' })
  @IsNumber()
  commentsCount!: number

  @ApiProperty({ description: 'Number of likes on the post' })
  @IsNumber()
  likesCount!: number

  @ApiProperty({ description: 'Number of saves/bookmarks of the post' })
  @IsNumber()
  savesCount!: number

  @ApiProperty({ description: 'Last activity timestamp on the post' })
  @IsDate()
  lastActiveAt!: Date

  @ApiProperty({ description: 'Post creation timestamp' })
  @IsDate()
  createdAt!: Date

  @ApiProperty({ description: 'Post last update timestamp' })
  @IsDate()
  updatedAt!: Date

  @ApiPropertyOptional({ 
    description: 'Array of topics associated with the post',
    type: [TopicDto]
  })
  @ValidateNested({ each: true })
  @Type(() => TopicDto)
  topics?: TopicDto[]

  @ApiPropertyOptional({ 
    description: 'Array of tags associated with the post',
    type: [TagDto]
  })
  @ValidateNested({ each: true })
  @Type(() => TagDto)
  tags?: TagDto[]

  @ApiPropertyOptional({ 
    description: 'User interactions with the post',
    type: PostInteractionsDto
  })
  @ValidateNested()
  @Type(() => PostInteractionsDto)
  interactions?: PostInteractionsDto
}
