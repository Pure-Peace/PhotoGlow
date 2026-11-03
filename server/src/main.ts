import { bootstrap } from './bootstrap'

bootstrap().catch((err) => {
  console.error('Failed to start application', err)
  process.exit(1)
})
