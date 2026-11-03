import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator'

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentpassword123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword!: string
}

export class UpdateEmailDto {
  @ApiProperty({
    description: 'Current password',
    example: 'currentpassword123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword!: string

  @ApiProperty({
    description: 'Verification code sent to new email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  verificationCode!: string

  @ApiProperty({
    description: 'New email address',
    example: 'newemail@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  newEmail!: string
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'User email',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string

  @ApiProperty({
    description: 'Verification code sent to email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  verification!: string

  @ApiProperty({
    description: 'New password',
    example: 'newpassword123',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string
}
