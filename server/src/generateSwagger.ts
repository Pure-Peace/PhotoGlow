import { createApp, createSwagger, exportSwaggerSpec } from './bootstrap'

export const generateSwagger = async () => {
  const app = await createApp()
  const document = createSwagger(app)
  exportSwaggerSpec(document, process.env.SWAGGER_SPEC_PATH)
  await app.close()
}

generateSwagger().catch((err) => {
  console.error('Failed to generate swagger', err)
  process.exit(1)
})
