import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      // Return default onboarding progress for unauthenticated users
      return NextResponse.json({ 
        progress: {
          id: 'default',
          userId: 'anonymous',
          createdFirstProject: false,
          connectedIntegration: false,
          ranInSandbox: false,
          deployedToStaging: false,
          usedAssistant: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    }

    // Get or create onboarding progress
    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: session.user.id }
    })

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId: session.user.id }
      })
    }

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { step } = await request.json()

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 })
    }

    // Update the specific step
    const progress = await prisma.onboardingProgress.upsert({
      where: { userId: session.user.id },
      update: { [step]: true },
      create: { 
        userId: session.user.id,
        [step]: true 
      }
    })

    return NextResponse.json({ progress })
  } catch (error) {
    console.error('Error updating onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to update onboarding progress' },
      { status: 500 }
    )
  }
}