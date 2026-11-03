import { CreateTemplateCommand, SESClient } from '@aws-sdk/client-ses'
import { awsSESKeys } from '@photoglow/shared/env'

const createTemplateCommand = new CreateTemplateCommand({
  Template: {
    TemplateName: 'PHOTOGLOW_VERIFICATION_CODE',
    HtmlPart: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #2c5282;
              font-size: 24px;
              margin-bottom: 20px;
              text-align: center;
            }
            .verification-code {
              background-color: #f7fafc;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
              font-size: 18px;
              color: #4a5568;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 14px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Hello, {{contact.firstName}}! 👋</h1>
            <div class="verification-code">
              Your verification code is: <strong>{{code}}</strong>
            </div>
            <div class="footer">
              This verification code will expire in 10 minutes.<br>
              If you didn't request this code, please ignore this email.
            </div>
          </div>
        </body>
      </html>
    `,
    SubjectPart: 'Photoglow Verification Code',
  },
})

const accessKeyId = process.env[awsSESKeys.accessKeyId]
const secretAccessKey = process.env[awsSESKeys.secretAccessKey]
const region = process.env[awsSESKeys.region]

if (!accessKeyId || !secretAccessKey || !region) {
  throw new Error(
    'AWS_SES_ACCESS_KEY_ID, AWS_SES_SECRET_ACCESS_KEY, and AWS_SES_REGION must be set'
  )
}

const sesClient = new SESClient({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region,
})

await sesClient.send(createTemplateCommand)
