import { Injectable, Logger } from '@nestjs/common'
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { v4 as uuidv4 } from 'uuid'

import { awsS3Keys } from '@photoglow/shared/env'

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name)

  private s3: S3Client
  private readonly bucketName: string
  private readonly region: string

  constructor() {
    const accessKeyId = process.env[awsS3Keys.accessKeyId]
    const secretAccessKey = process.env[awsS3Keys.secretAccessKey]
    const region = process.env[awsS3Keys.region]
    const bucketName = process.env[awsS3Keys.bucket]

    if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
      throw new Error(
        'environment variables AWS_S3_ACCESS_KEY_ID, AWS_S3_SECRET_ACCESS_KEY, AWS_S3_REGION, and AWS_S3_BUCKET must be set'
      )
    }

    this.region = region
    this.bucketName = bucketName

    this.logger.log(`[init] S3 region: ${this.region}`)
    this.logger.log(`[init] S3 bucket name: ${this.bucketName}`)

    this.s3 = new S3Client({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region,
    })
  }

  async uploadFile(
    file: Express.Multer.File,
    prefix = 'uploads'
  ): Promise<{
    key: string
    bucket: string
    region: string
    url: string
  }> {
    const fileExtension = file.originalname.split('.').pop() || ''
    const uniqueFileName = `${prefix}/${uuidv4()}${fileExtension ? `.${fileExtension}` : ''}`

    // Validate and normalize mime type
    const allowedImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ]
    const contentType = allowedImageTypes.includes(file.mimetype)
      ? file.mimetype
      : 'image/jpeg'

    // Set cache control based on prefix
    const cacheControl =
      prefix === 'avatars'
        ? 'public, max-age=31536000' // Cache avatars for 1 year
        : 'public, max-age=2592000' // Cache other images for 30 days

    const upload = new Upload({
      client: this.s3,
      params: {
        Bucket: this.bucketName,
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: contentType,
        CacheControl: cacheControl,
        ACL: 'public-read',
        Metadata: {
          'original-filename': file.originalname,
          'upload-date': new Date().toISOString(),
        },
      },
    })

    await upload.done()

    return {
      key: uniqueFileName,
      bucket: this.bucketName,
      region: this.region,
      url: this.getFileUrl(uniqueFileName),
    }
  }

  async getObject(
    key: string,
    bucket?: string
  ): Promise<GetObjectCommandOutput> {
    return await this.s3.send(
      new GetObjectCommand({
        Bucket: bucket || this.bucketName,
        Key: key,
      })
    )
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    )
  }

  getFileUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`
  }
}
