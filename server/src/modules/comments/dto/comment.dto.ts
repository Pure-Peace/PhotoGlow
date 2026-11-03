import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Great photo! Love the colors.',
  })
  @IsString()
  @IsNotEmpty()
  content!: string

  @IsString()
  @IsOptional()
  parentId?: string
}

export class CommentResponseDto {
  @ApiProperty({
    description: 'Comment ID',
    example: 'comment-id-123',
  })
  id!: string

  @ApiProperty({
    description: 'Comment content',
    example: 'Great photo! Love the colors.',
  })
  content!: string

  @ApiProperty({
    description: 'Comment author',
    example: {
      id: 'user-id',
      username: 'user123',
      displayName: 'User Name',
      avatar: 'https://example.com/avatar.png',
    },
  })
  author!: {
    id: string
    username: string
    displayName?: string
    avatar?: string
  }

  @ApiProperty({
    description: 'Comment creation date',
    example: '2023-01-01T12:00:00Z',
  })
  createdAt!: string

  @ApiProperty({
    description: 'Number of likes',
    example: 42,
  })
  likes!: number

  @ApiProperty({
    description: 'Number of replies',
    example: 5,
  })
  replies!: number

  @ApiProperty({
    description: 'Whether the authenticated user has liked this comment',
    example: false,
  })
  hasLiked!: boolean
}
