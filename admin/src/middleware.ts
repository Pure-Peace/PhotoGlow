import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// JWT secret should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'
const COOKIE_NAME = 'admin_token'

// Routes that don't require authentication
const publicRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the route is public
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Get the token from the cookies
  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Call the verify API endpoint
    const verifyResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    )

    if (!verifyResponse.ok) {
      throw new Error('Token verification failed')
    }

    // Token is valid, allow the request
    return NextResponse.next()
  } catch (error) {
    console.log('error', error)
    // Token is invalid, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

// Only run the middleware on these routes:
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
