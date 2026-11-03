import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class ReportPostDto {
  @ApiProperty({
    description: 'Post ID',
    example: 'post-id-123',
  })
  @IsString()
  @IsNotEmpty()
  postId!: string

  @ApiProperty({
    description: 'Report reason',
    example: 'This content violates community guidelines',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string
}

export class ReportUserDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user-id-123',
  })
  @IsString()
  @IsNotEmpty()
  userId!: string

  @ApiProperty({
    description: 'Report reason',
    example: 'This user violates community guidelines',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string
}
