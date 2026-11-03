import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    
    // Calculate skip for pagination
    const skip = (page - 1) * pageSize

    // Build the query
    const whereClause = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}

    // Fetch posts with pagination
    const posts = await photoglowDb.post.findMany({
      where: whereClause as any,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    })

    // Get total count for pagination
    const total = await photoglowDb.post.count({
      where: whereClause as any,
    })

    // Calculate total pages
    const totalPages = Math.ceil(total / pageSize)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        pageSize,
        totalPages,
        total,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
