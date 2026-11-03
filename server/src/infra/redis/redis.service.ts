import { Injectable } from '@nestjs/common'
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Logger } from '@nestjs/common'
import Redis from 'ioredis'

import { redisKeys, redisDefault } from '@photoglow/shared/env'

export const DEFAULT_HOST = redisDefault.host
export const DEFAULT_PORT = redisDefault.port
export const DEFAULT_PASSWORD = redisDefault.password
export const DEFAULT_DB = redisDefault.db

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis
  private readonly logger = new Logger(RedisService.name)

  constructor() {
    const host = process.env[redisKeys.host] || DEFAULT_HOST
    const port = Number(process.env[redisKeys.port]) || DEFAULT_PORT
    const password = process.env[redisKeys.password] || DEFAULT_PASSWORD
    const db = Number(process.env[redisKeys.db]) || DEFAULT_DB

    this.logger.log(`[init] Redis address: ${host}:${port}`)
    this.logger.log(`[init] Redis db: ${db}`)

    this.client = new Redis({
      host,
      port,
      password,
      db,
    })
  }

  async onModuleInit() {
    // Connection is established when the client is instantiated
    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`, err.stack)
    })

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis')
    })
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  // Get a value from Redis
  async get(key: string): Promise<string | null> {
    return await this.client.get(key)
  }

  // Set a value in Redis
  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return await this.client.set(key, value, 'EX', ttl)
    }
    return await this.client.set(key, value)
  }

  // Delete a key from Redis
  async del(key: string): Promise<number> {
    return await this.client.del(key)
  }

  // Check if a key exists
  async exists(key: string): Promise<number> {
    return await this.client.exists(key)
  }

  // Set expiration time for a key
  async expire(key: string, seconds: number): Promise<number> {
    return await this.client.expire(key, seconds)
  }

  // Get the Redis client for more complex operations
  getClient(): Redis {
    return this.client
  }
}
