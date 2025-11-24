import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Set the cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return NextResponse.json(
      { message: 'Cookie set successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Set cookie error:', error)
    return NextResponse.json(
      { error: 'Failed to set authentication cookie' },
      { status: 500 }
    )
  }
} 