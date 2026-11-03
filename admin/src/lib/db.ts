import { PrismaClient as AdminPrismaClient } from 'photoglow-admin-prisma-client'
import { PrismaClient as PhotoglowPrismaClient } from '@photoglow/database'

// Admin database client
const adminDb = new AdminPrismaClient()

// Photoglow database client (photoglow database)
const photoglowDb = new PhotoglowPrismaClient()

export { adminDb, photoglowDb } 
