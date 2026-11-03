import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { z } from 'zod'

// Schema for validating post updates
const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'FOLLOWERS']).optional(),
  type: z.enum(['PHOTO', 'VIDEO', 'ARTICLE']).optional(),
})

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

    const postId = params.id

    // Fetch the post
    const post = await photoglowDb.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        media: true,
      },
    })

    if (!post) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    // Get interaction counts
    const likesCount = await photoglowDb.like.count({
      where: { postId },
    })

    const commentsCount = await photoglowDb.comment.count({
      where: { postId },
    })

    const savesCount = await photoglowDb.save.count({
      where: { postId },
    })

    return NextResponse.json({
      ...post,
      likesCount,
      commentsCount,
      savesCount,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id
    const body = await request.json()

    // Validate update data
    const validationResult = updatePostSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Invalid data',
          errors: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    // Verify post exists
    const existingPost = await photoglowDb.post.findUnique({
      where: { id: postId },
    })

    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    // Update the post
    const updatedPost = await photoglowDb.post.update({
      where: { id: postId },
      data: validationResult.data,
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
    })

    // Get interaction counts
    const likesCount = await photoglowDb.like.count({
      where: { postId },
    })

    const commentsCount = await photoglowDb.comment.count({
      where: { postId },
    })

    const savesCount = await photoglowDb.save.count({
      where: { postId },
    })

    return NextResponse.json({
      ...updatedPost,
      likesCount,
      commentsCount,
      savesCount,
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const postId = params.id

    // Verify post exists
    const existingPost = await photoglowDb.post.findUnique({
      where: { id: postId },
    })

    if (!existingPost) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 })
    }

    // First delete related records
    await Promise.all([
      photoglowDb.like.deleteMany({ where: { postId } }),
      photoglowDb.comment.deleteMany({ where: { postId } }),
      photoglowDb.save.deleteMany({ where: { postId } }),
      photoglowDb.media.deleteMany({ where: { postId } }),
    ])

    // Then delete the post
    await photoglowDb.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
