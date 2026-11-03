import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin, logAction } from '@/lib/auth'

// Delete user avatar
export async function DELETE(
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

    // Check if user exists
    const existingUser = await photoglowDb.user.findUnique({
      where: { id },
      select: {
        id: true,
        avatar: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // If user has no avatar, return success
    if (!existingUser.avatar) {
      return NextResponse.json({
        message: 'Avatar already removed',
      })
    }

    // Update user to remove avatar
    const updatedUser = await photoglowDb.user.update({
      where: { id },
      data: {
        avatar: null,
      },
      select: {
        id: true,
        avatar: true,
      },
    })

    // Log the action
    await logAction(admin.id, 'USER_AVATAR_DELETE', 'User', id, {
      previousAvatar: existingUser.avatar,
    })

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Error deleting user avatar:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
