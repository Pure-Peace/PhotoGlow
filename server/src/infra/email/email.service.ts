import { Injectable } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { SendTemplatedEmailCommand, SESClient } from '@aws-sdk/client-ses'
import { awsSESKeys } from '@photoglow/shared/env'
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  private readonly sesClient: SESClient

  constructor() {
    const accessKeyId = process.env[awsSESKeys.accessKeyId]
    const secretAccessKey = process.env[awsSESKeys.secretAccessKey]
    const region = process.env[awsSESKeys.region]

    if (!accessKeyId || !secretAccessKey || !region) {
      throw new Error(
        'AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, and AWS_SES_REGION must be set'
      )
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  async sendVerificationCode(to: string, code: string, type: string) {
    this.logger.log(
      `Sending verification code to ${to} with code ${code} and type ${type}`
    )
    try {
      const sendReminderEmailCommand = new SendTemplatedEmailCommand({
        Destination: { ToAddresses: [to] },
        TemplateData: JSON.stringify({
          contact: { firstName: to },
          code,
        }),
        Source: 'mail@photoglow.xyz',
        Template: 'PHOTOGLOW_VERIFICATION_CODE',
      })
      await this.sesClient.send(sendReminderEmailCommand)
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }
}
