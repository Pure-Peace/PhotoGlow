import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import type { Request } from 'express'

import { TokenService } from '@/infra/token/token.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = this.extractTokenFromHeader(request)
    const refreshToken = request.cookies['refresh_token']

    // If no tokens provided at all
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('No authentication tokens provided')
    }

    try {
      // First try to validate access token
      if (accessToken) {
        const userId = await this.tokenService.validateAccessToken(accessToken)
        request['user'] = { id: userId }
        return true
      }

      // If access token is invalid or not present, try refresh token
      if (refreshToken) {
        const userId =
          await this.tokenService.validateRefreshToken(refreshToken)
        if (userId) {
          // Generate new access token
          const newAccessToken = this.tokenService.generateAccessToken(userId)

          // Add the new access token to response headers
          const response = context.switchToHttp().getResponse()
          response.setHeader('New-Access-Token', newAccessToken)

          // Set user in request
          request['user'] = { id: userId }
          return true
        }
      }

      throw new UnauthorizedException('Invalid authentication tokens')
    } catch {
      throw new UnauthorizedException('Invalid authentication tokens')
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = this.extractTokenFromHeader(request)
    const refreshToken = request.cookies['refresh_token']

    if (!accessToken && !refreshToken) {
      return true // Allow request to proceed without authentication
    }

    try {
      // First try to validate access token
      if (accessToken) {
        const userId = await this.tokenService.validateAccessToken(accessToken)
        request['user'] = { id: userId }
        return true
      }

      // If access token is invalid or not present, try refresh token
      if (refreshToken) {
        const userId =
          await this.tokenService.validateRefreshToken(refreshToken)
        if (userId) {
          // Generate new access token
          const newAccessToken = this.tokenService.generateAccessToken(userId)

          // Add the new access token to response headers
          const response = context.switchToHttp().getResponse()
          response.setHeader('New-Access-Token', newAccessToken)

          // Set user in request
          request['user'] = { id: userId }
          return true
        }
      }

      return true // Allow request to proceed if tokens are invalid
    } catch {
      return true // Allow request to proceed if token validation fails
    }
  }
}
