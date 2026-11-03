import { NestFactory } from '@nestjs/core'
import {
  Logger,
  ValidationPipe,
  VersioningType,
  type INestApplication,
  type NestApplicationOptions,
} from '@nestjs/common'
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
} from '@nestjs/swagger'
import cookieParser from 'cookie-parser'

import { AppModule } from '@/app/app.module'
import { siteDefault, siteKeys } from '@photoglow/shared/env'

import fs from 'fs'
import { join } from 'path'

const logger = new Logger('bootstrap')

export const isDev = process.env.NODE_ENV === 'development'
export const PORT = process.env[siteKeys.serverPort] ?? siteDefault.serverPort

/* export const FRONTEND_URL = process.env.FRONTEND_URL ?? siteDefault.frontendUrl */

/* const debugOrigin = () => {
  const logger = new Logger(debugOrigin.name)
  return (
    origin: string,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    logger.debug(`Incoming request from origin: ${origin}`)
    if (!origin || origin === FRONTEND_URL) {
      logger.debug(`Allowing request from origin: ${origin}`)
      callback(null, true)
    } else {
      logger.warn(`Blocking request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  }
} */

export const exportSwaggerSpec = (doc: OpenAPIObject, path?: string) => {
  const p = path || join(process.cwd(), 'swagger-spec.json')
  fs.writeFileSync(p, JSON.stringify(doc))
  logger.log(`Swagger spec written to ${p}`)
}

export const nestOptions: NestApplicationOptions = {
  logger: ['error', 'warn', 'log', 'debug'],
  cors: {
    origin: [
      'https://photoglow.xyz',
      'http://photoglow.xyz',
      'https://www.photoglow.xyz',
      'http://www.photoglow.xyz',
      'http://localhost:8080',
      'https://localhost:8080',
      'http://localhost',
      'https://localhost',
    ],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
    exposedHeaders: [
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Credentials',
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
}

export const createApp = async () => {
  /* logger.log(`[init] Frontend URL: ${FRONTEND_URL}`) */

  const app = await NestFactory.create(AppModule, nestOptions)

  app.setGlobalPrefix('api')

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  app.use(cookieParser())

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  )

  return app
}

export const createSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('PhotoGlow API')
    .setDescription('The Photo Glow API documentation')
    .setVersion('0.1')
    .addBearerAuth()
    .build()

  return SwaggerModule.createDocument(app, config)
}

export async function bootstrap() {
  const app = await createApp()
  const document = createSwagger(app)

  SwaggerModule.setup('api', app, document)

  await app.listen(PORT, () => {
    logger.log(`Server is listening at port ${PORT}`)
    logger.log(`!! Current environment is: ${process.env.NODE_ENV}`)
    logger.log(`Swagger ui available at http://localhost:${PORT}/api`)
    logger.log(
      `Swagger json documentation available at http://localhost:${PORT}/api-json`
    )
    logger.log(
      `Swagger yaml documentation available at http://localhost:${PORT}/api-yaml`
    )
    logger.log(
      `GraphQL playground available at http://localhost:${PORT}/graphql`
    )
  })
}
