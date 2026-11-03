import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

import { IsValidUsername } from '@/common/decorators/username.decorator'
import type { SanitizedUser } from '@photoglow/shared/types/user'

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string

  @ApiProperty({
    description: 'Username',
    example: 'john.doe',
    pattern: '^(?!.*[._]{2})[a-zA-Z0-9][a-zA-Z0-9._]{0,18}[a-zA-Z0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  @IsValidUsername()
  username!: string

  @ApiProperty({
    description: 'Email verification code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  verification!: string
}

export class AuthDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string

  @ApiProperty({
    description: 'User information',
    example: {
      id: 'user-id',
      username: 'user123',
      displayName: 'User Name',
      avatar: 'https://example.com/avatar.png',
      bio: 'User bio',
      email: 'user@example.com',
    },
  })
  user!: SanitizedUser
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken!: string
}
export class VerificationDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({
    description: 'Verification type',
    example: 'signup',
    enum: ['signup', 'reset-password', 'change-email'],
  })
  @IsString()
  @IsNotEmpty()
  type!: 'signup' | 'reset-password' | 'change-email'
}
