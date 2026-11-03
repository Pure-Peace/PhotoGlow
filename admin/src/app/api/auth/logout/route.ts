import { NextRequest, NextResponse } from 'next/server'
import { removeTokenCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Remove the token cookie
    await removeTokenCookie()

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
