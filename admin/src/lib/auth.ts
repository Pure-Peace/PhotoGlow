import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { headers } from 'next/headers'
import { adminDb } from './db'

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const JWT_EXPIRES_IN = '24h'
const COOKIE_NAME = 'admin_token'

export interface AdminJwtPayload {
  id: string
  email: string
  role: string
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

export async function createToken(payload: AdminJwtPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export async function verifyToken(
  token: string
): Promise<AdminJwtPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwtPayload
  } catch (error) {
    return null
  }
}

export async function setTokenCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60, // 24 hours
  })
}

export async function removeTokenCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function getTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export async function loginAdmin(email: string, password: string) {
  // Find admin by email
  const admin = await adminDb.admin.findUnique({
    where: { email },
  })

  if (!admin) {
    throw new Error('Invalid email or password')
  }

  // Check if admin is active
  if (!admin.active) {
    throw new Error('Account is inactive')
  }

  // Verify password
  const isValid = await verifyPassword(password, admin.password)
  if (!isValid) {
    throw new Error('Invalid email or password')
  }

  // Update last login
  await adminDb.admin.update({
    where: { id: admin.id },
    data: { lastLogin: new Date() },
  })

  // Create session
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const ipAddress =
    headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || ''

  const session = await adminDb.adminSession.create({
    data: {
      adminId: admin.id,
      token: await createToken({
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      userAgent,
      ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
    },
  })

  // Log the action
  await adminDb.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'LOGIN',
      ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
      details: JSON.stringify({ userAgent }),
    },
  })

  return { admin, token: session.token }
}

export async function getCurrentAdmin() {
  const token = await getTokenFromCookies()
  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const admin = await adminDb.admin.findUnique({
    where: { id: payload.id },
  })

  return admin
}

export async function logAction(
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: any
) {
  const headersList = await headers()
  const ipAddress =
    headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || ''

  await adminDb.adminLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress: typeof ipAddress === 'string' ? ipAddress : ipAddress[0],
    },
  })
}
