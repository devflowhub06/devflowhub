import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    return NextResponse.json({
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
        }
      } : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Debug session error:', error)
    return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 })
  }
}
