import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const skip = parseInt(searchParams.get('skip') || '0', 10)
    const take = parseInt(searchParams.get('take') || '10', 10)
    const search = searchParams.get('search') || ''
    const action = searchParams.get('action') || ''

    // Build query filters
    const where: any = {}

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
        { entityId: { contains: search, mode: 'insensitive' } },
        { admin: { name: { contains: search, mode: 'insensitive' } } },
        { admin: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (action) {
      where.action = action
    }

    // Fetch logs with pagination and include admin data
    const [logs, total] = await Promise.all([
      adminDb.adminLog.findMany({
        skip,
        take,
        where,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          admin: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      adminDb.adminLog.count({ where }),
    ])

    return NextResponse.json({ logs, total })
  } catch (error) {
    console.error('Error fetching admin logs:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
