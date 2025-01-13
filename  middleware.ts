import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/register'
  const token = request.cookies.get('token')?.value || ''

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  if (token) {
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      
      if (path.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.nextUrl))
      }

      if (path.startsWith('/user') && payload.role !== 'user') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.nextUrl))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
  }
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/admin/:path*',
    '/user/:path*',
    '/profile',
  ]
}

