import { NextResponse, NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/@')) {
    const url = request.nextUrl.clone()
    url.pathname = '/profile' + url.pathname.replace(/@/g, '')
    return NextResponse.rewrite(url)
  }
}
