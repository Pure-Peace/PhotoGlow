import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { UserStatus } from '@photoglow/database'

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get total users
    const totalUsers = await photoglowDb.user.count()
    
    // Get active users in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsers = await photoglowDb.user.count({
      where: {
        lastActiveAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get new users in the last 30 days
    const newUsers = await photoglowDb.user.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get total posts
    const totalPosts = await photoglowDb.post.count()
    
    // Get new posts in the last 30 days
    const newPosts = await photoglowDb.post.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })
    
    // Get total comments
    const totalComments = await photoglowDb.comment.count()
    
    // Get new comments in the last 30 days
    const newComments = await photoglowDb.comment.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Get user status counts using type-safe Prisma queries
    const statusValues = Object.values(UserStatus);
    const userStatusCounts = [];
    
    for (const status of statusValues) {
      const count = await photoglowDb.user.count({
        where: { status }
      });
      
      userStatusCounts.push({
        status,
        count
      });
    }
    
    return NextResponse.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        new: newUsers,
        byStatus: userStatusCounts
      },
      content: {
        posts: {
          total: totalPosts,
          new: newPosts
        },
        comments: {
          total: totalComments,
          new: newComments
        }
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
