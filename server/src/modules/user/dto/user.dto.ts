import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsBoolean,
  IsPhoneNumber,
  IsEnum,
  IsDate,
  IsNumber,
  IsUUID,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

import { UserStatus } from '@photoglow/shared/types/user'

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 30)
  username?: string

  @IsOptional()
  @IsString()
  @Length(1, 50)
  displayName?: string

  @IsOptional()
  @IsString()
  @Length(1, 500)
  bio?: string

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus
}

export class SanitizedUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id!: string

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  @IsString()
  username!: string

  @ApiProperty({
    description: 'Email address',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiProperty({
    description: 'Display name',
    example: 'John Doe',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  displayName!: string | null

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  avatar!: string | null

  @ApiProperty({
    description: 'User bio',
    example: 'Hello, I am John!',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  bio!: string | null

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.active,
  })
  @IsEnum(UserStatus)
  status!: UserStatus

  @ApiProperty({
    description: 'Email verification date',
    example: '2024-03-20T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  emailVerified?: Date

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string

  @ApiProperty({
    description: 'Phone verification date',
    example: '2024-03-20T12:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  phoneVerified?: Date

  @ApiProperty({
    description: 'Two-factor authentication enabled',
    example: false,
  })
  @IsBoolean()
  twoFactorEnabled!: boolean

  @ApiProperty({
    description: 'Last active timestamp',
    example: '2024-03-20T12:00:00Z',
  })
  @IsDate()
  lastActiveAt!: Date

  @ApiProperty({
    description: 'Number of followers',
    example: 100,
  })
  @IsNumber()
  followersCount!: number

  @ApiProperty({
    description: 'Number of following',
    example: 50,
  })
  @IsNumber()
  followingCount!: number

  @ApiProperty({
    description: 'Account creation date',
    example: '2024-03-20T12:00:00Z',
  })
  @IsDate()
  createdAt!: Date

  @ApiProperty({
    description: 'Last update date',
    example: '2024-03-20T12:00:00Z',
  })
  @IsDate()
  updatedAt!: Date
}
