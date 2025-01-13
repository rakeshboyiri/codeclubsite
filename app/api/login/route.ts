import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { SignJWT } from 'jose'
import clientPromise from '@/lib/mongodb'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const client = await clientPromise
    const db = client.db('codeclub')
    const user = await db.collection('users').findOne({ email })

    if (!user || !(await compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await new SignJWT({ 
      sub: user._id.toString(),
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET))

    const response = NextResponse.json(
      { message: 'Login successful', role: user.role },
      { status: 200 }
    )

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

