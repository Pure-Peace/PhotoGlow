import {
  Controller,
  Body,
  Post,
  Req,
  UnauthorizedException,
  Get,
  UseGuards,
  Res,
  Logger,
  Delete,
  Query,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import {
  LoginDto,
  RegisterDto,
  VerificationDto,
  AuthDto,
} from '@/modules/auth/dto/auth.dto'
import { CookieService } from '@/infra/cookie/cookie.service'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import type { SanitizedUser } from '@photoglow/shared/types/user'
import { SanitizedUserDto } from '@/modules/user/dto/user.dto'
import { OauthService } from '@/infra/oauth/oauth.service'
import { siteDefault, siteKeys } from '@photoglow/shared/env'
import { TokenService } from '@/infra/token/token.service'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)

  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
    private readonly oauthService: OauthService,
    private readonly tokenService: TokenService
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user info' })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved',
    type: SanitizedUserDto,
  })
  @ApiResponse({ status: 401, description: 'Not authenticated' })
  async getAuth(@CurrentUser() user: { id: string }): Promise<SanitizedUser> {
    return this.authService.getAuth(user.id)
  }

  @Get('oauth-accounts')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user oauth accounts' })
  @ApiResponse({ status: 200, description: 'Oauth accounts retrieved' })
  async getOauthAccounts(
    @CurrentUser() user: { id: string }
  ): Promise<Record<string, string>> {
    return this.authService.getOauthAccounts(user.id)
  }

  @Get('google')
  @ApiOperation({ summary: 'Google OAuth' })
  @ApiResponse({ status: 200, description: 'Google OAuth' })
  async googleOAuth(
    @Res() res: Response,
    @Query('token') token?: string
  ): Promise<void> {
    res.redirect(this.oauthService.generateGoogleOAuth2AuthUrl(token))
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google OAuth callback' })
  async googleOAuthCallback(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const code = req.query.code as string
    const error = req.query.error as string

    // avaliable when linking google account
    const state = req.query.state as string

    if (error || !code) {
      throw new UnauthorizedException(`${error}`)
    }

    let userId: string | undefined

    // if state is provided, validate access token
    if (state) {
      userId = await this.tokenService.validateAccessToken(state)
    }

    const frontendUrl =
      process.env[siteKeys.frontendUrl] || siteDefault.frontendUrl

    try {
      const [authResult, refreshToken] =
        await this.authService.handleGoogleOAuthCallback(code, userId)

      // set refresh token in cookie
      this.cookieService.setRefreshToken(refreshToken)

      // Redirect to frontend with access token
      res.redirect(`${frontendUrl}${userId ? '/settings' : ''}`)
    } catch (error) {
      this.logger.error(error)
      res.redirect(`${frontendUrl}/error?message=Authentication failed`)
    }
  }

  @Delete('google')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete google oauth account' })
  @ApiResponse({ status: 200, description: 'Google oauth account deleted' })
  async deleteGoogleOAuth(@CurrentUser() user: { id: string }): Promise<void> {
    await this.authService.deleteGoogleOAuth(user.id)
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User authenticated successfully',
    type: AuthDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthDto> {
    const [result, refreshToken] = await this.authService.login(loginDto)
    this.cookieService.setRefreshToken(refreshToken)
    return result
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email or username already in use' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthDto> {
    const [result, refreshToken] = await this.authService.register(registerDto)
    this.cookieService.setRefreshToken(refreshToken)
    return result
  }

  @Post('logout')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'User logged out successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  async logout(): Promise<{ success: boolean }> {
    const refreshToken = this.cookieService.getRefreshToken()
    if (refreshToken) {
      await this.authService.logout(refreshToken)
    }
    this.cookieService.clearRefreshToken()
    return { success: true }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Req() req: Request): Promise<{ accessToken: string }> {
    const refreshToken = req.body.refreshToken || req.cookies['refresh_token']
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided')
    }
    const accessToken = await this.authService.refreshAccessToken(refreshToken)

    return { accessToken }
  }

  @Post('verification/send')
  @ApiOperation({ summary: 'Send email verification code' })
  @ApiResponse({
    status: 200,
    description: 'Verification code sent',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  async sendVerificationCode(
    @Body() verificationDto: VerificationDto
  ): Promise<{ success: boolean }> {
    const success = await this.authService.sendEmailVerificationCode(
      verificationDto.email,
      verificationDto.type
    )
    return { success }
  }
}
