import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class FollowDto {
  @ApiProperty({
    description: 'Follow state',
    example: true,
  })
  @IsBoolean()
  following!: boolean
}

export class LikeDto {
  @ApiProperty({
    description: 'Like state',
    example: true,
  })
  @IsBoolean()
  liked!: boolean
}

export class SaveDto {
  @ApiProperty({
    description: 'Save state',
    example: true,
  })
  @IsBoolean()
  saved!: boolean
}
