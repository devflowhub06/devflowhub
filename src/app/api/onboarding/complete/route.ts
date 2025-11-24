import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { completeOnboardingStep, OnboardingStep } from '@/lib/services/onboarding'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { step } = await request.json()
  if (!step) return NextResponse.json({ error: 'Missing step' }, { status: 400 })
  const data = await completeOnboardingStep(session.user.id, step as OnboardingStep)
  return NextResponse.json({ success: true, data })
}


