import { Injectable } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { googleOauthKeys } from '@photoglow/shared/env'
import { googleOauthDefault } from '@photoglow/shared/env'

import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name)

  private googleOAuth2Client: OAuth2Client

  constructor() {
    this.googleOAuth2Client = this.newGoogleOAuth2Client()
  }

  newGoogleOAuth2Client() {
    const client_id =
      process.env[googleOauthKeys.clientId] || googleOauthDefault.clientId
    const client_secret =
      process.env[googleOauthKeys.clientSecret] ||
      googleOauthDefault.clientSecret
    const redirect_uri =
      process.env[googleOauthKeys.redirectUri] || googleOauthDefault.redirectUri

    const oauth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uri
    )

    return oauth2Client
  }

  generateGoogleOAuth2AuthUrl(token?: string) {
    const scopes = ['email profile']

    const authorizationUrl = this.googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      state: token,
    })

    return authorizationUrl
  }
}
