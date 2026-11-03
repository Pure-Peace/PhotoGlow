import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const decoded = verifyToken(token)

    return NextResponse.json({
      valid: true,
      decoded,
    })
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        message: 'Invalid token',
      },
      { status: 401 }
    )
  }
}
