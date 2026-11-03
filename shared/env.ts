export const siteKeys = {
  frontendUrl: 'FRONTEND_URL',
  serverPort: 'SERVER_PORT',
}

export const siteDefault = {
  frontendUrl: 'http://localhost:8080',
  serverPort: 8001,
}

export const redisDefault = {
  host: 'localhost',
  port: 6379,
  password: undefined,
  db: 0,
}

export const redisKeys = {
  host: 'REDIS_HOST',
  port: 'REDIS_PORT',
  password: 'REDIS_PASSWORD',
  db: 'REDIS_DB',
}

export const awsS3Keys = {
  accessKeyId: 'AWS_S3_ACCESS_KEY_ID',
  secretAccessKey: 'AWS_S3_SECRET_ACCESS_KEY',
  region: 'AWS_S3_REGION',
  bucket: 'AWS_S3_BUCKET',
}

export const awsSESKeys = {
  accessKeyId: 'AWS_SES_ACCESS_KEY_ID',
  secretAccessKey: 'AWS_SES_SECRET_ACCESS_KEY',
  region: 'AWS_SES_REGION',
}

export const jwtKeys = {
  secret: 'JWT_SECRET',
}

export const jwtDefault = {
  secret: '66666666666666666666666666666666',
}

export const tokenKeys = {
  accessTokenExpiration: 'ACCESS_TOKEN_EXPIRATION',
  refreshTokenExpiration: 'REFRESH_TOKEN_EXPIRATION',
}

export const tokenDefault = {
  accessTokenExpiration: '1h',
  refreshTokenExpiration: '7d',
}

export const verificationKeys = {
  verificationCodeExpiration: 'VERIFICATION_CODE_EXPIRATION',
}

export const verificationDefault = {
  verificationCodeExpiration: '10m',
}

export const googleOauthKeys = {
  clientId: 'GOOGLE_OAUTH_CLIENT_ID',
  clientSecret: 'GOOGLE_OAUTH_CLIENT_SECRET',
  redirectUri: 'GOOGLE_OAUTH_REDIRECT_URI',
}

export const googleOauthDefault = {
  clientId: '',
  clientSecret: '',
  redirectUri: 'http://localhost:8001/api/v1/auth/google/callback',
}
