import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current admin from the token
    const admin = await getCurrentAdmin()

    if (!admin) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return the admin without the password
    const { password, ...adminData } = admin

    return NextResponse.json({
      admin: adminData,
    })
  } catch (error) {
    console.error('Get current admin error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
