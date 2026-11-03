import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin, logAction } from '@/lib/auth'

// Define page size for pagination
const PAGE_SIZE = 10

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Build the query
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (status) {
      where.status = status
    }

    // Get total count for pagination
    const total = await photoglowDb.user.count({ where })

    // Get users with pagination, sorting and filtering
    const users = await photoglowDb.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        status: true,
        emailVerified: true,
        phoneVerified: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
        lastActiveAt: true,
        // Exclude sensitive fields like password
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    })

    // Log the action
    await logAction(
      admin.id,
      'USER_LIST_VIEW',
      'User',
      undefined,
      { page, search, status, sortBy, sortOrder }
    )

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil(total / PAGE_SIZE),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
