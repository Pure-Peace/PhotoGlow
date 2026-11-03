import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin, logAction } from '@/lib/auth'
import { z } from 'zod'

// User update schema
const userUpdateSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED', 'DELETED']).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(30).optional(),
  displayName: z.string().optional(),
  bio: z.string().max(500).optional(),
})

// Get user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get user details
    const user = await photoglowDb.user.findUnique({
      where: { id },
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
        twoFactorEnabled: true,
        followersCount: true,
        followingCount: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get user stats
    const postCount = await photoglowDb.post.count({
      where: { authorId: id },
    })

    const commentCount = await photoglowDb.comment.count({
      where: { authorId: id },
    })

    // Log the action
    await logAction(admin.id, 'USER_DETAILS_VIEW', 'User', id)

    return NextResponse.json({
      user,
      stats: {
        postCount,
        commentCount,
      },
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Parse request body
    const body = await request.json()

    const result = userUpdateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.flatten() },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await photoglowDb.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Update user
    const updatedUser = await photoglowDb.user.update({
      where: { id },
      data: result.data,
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Log the action
    await logAction(admin.id, 'USER_UPDATE', 'User', id, {
      changes: result.data,
      previousStatus: existingUser.status,
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    })
  } catch (error: any) {
    console.error('Error updating user:', error)

    // Handle unique constraint errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          message: 'A user with this email or username already exists',
          field: error.meta?.target?.[0] || 'unknown',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
