import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { loginAdmin, setTokenCookie } from '@/lib/auth'

// Login request schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    try {
      // Authenticate the admin
      const { admin, token } = await loginAdmin(email, password)

      // Set the token in a cookie
      await setTokenCookie(token)

      // Return the admin without the password
      const { password: _, ...adminData } = admin

      return NextResponse.json({
        message: 'Login successful',
        admin: adminData,
      })
    } catch (error: any) {
      return NextResponse.json(
        { message: error.message || 'Authentication failed' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
