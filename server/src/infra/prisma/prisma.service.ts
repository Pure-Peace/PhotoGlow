import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@photoglow/database'

// Define the event types that Prisma emits
interface QueryEvent {
  query: string
  params: string
  duration: number
  target: string
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    })

    // Use the properly typed event emitter
    const prismaWithEvents = this as PrismaClient & {
      $on: (event: 'query', callback: (event: QueryEvent) => void) => void
    }

    prismaWithEvents.$on('query', (e: QueryEvent) => {
      this.logger.debug(`Query: ${e.query}`)
      this.logger.debug(`Duration: ${e.duration}ms`)
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Successfully connected to database')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Successfully disconnected from database')
  }
}
