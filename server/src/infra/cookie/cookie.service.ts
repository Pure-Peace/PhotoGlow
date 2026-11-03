import { Inject, Injectable, Scope } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import type { Request, Response } from 'express'

import { RefreshToken } from '@/common/utils/token'

@Injectable({ scope: Scope.REQUEST })
export class CookieService {
  private response: Response

  constructor(@Inject(REQUEST) private request: Request) {
    // Express passes both request and response objects
    this.response = request.res as Response
  }

  setRefreshToken(refreshToken: RefreshToken): void {
    this.response.cookie('refresh_token', refreshToken.getToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: refreshToken.getExpiresIn(),
      path: '/',
    })
  }

  clearRefreshToken(): void {
    this.response.cookie('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      path: '/',
    })
  }

  getRefreshToken(): string | undefined {
    return this.request.cookies['refresh_token']
  }
}
