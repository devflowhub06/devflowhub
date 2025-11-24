import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getPlanLimits, getUsagePercentage, isUsageExceeded } from '@/lib/stripe'
import { usageTracker } from '@/lib/usage-tracker'

// GET /api/usage/limits - Get current usage and plan limits
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        paymentStatus: true,
        trialEndsAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current usage
    const usage = await usageTracker.getCurrentUsage(userId)
    
    // Normalize plan name (FREE -> free, PRO -> pro, etc.)
    const planName = user.plan.toLowerCase() as 'free' | 'pro' | 'enterprise'
    const limits = getPlanLimits(planName)
    
    // Calculate usage percentages
    const usagePercentage = getUsagePercentage(
      {
        aiTokens: usage.ai_tokens,
        previewMinutes: usage.preview_minutes,
        sandboxRuns: usage.sandbox_runs,
        deployments: usage.deployments
      },
      planName
    )

    // Check if limits exceeded
    const exceeded = isUsageExceeded(
      {
        aiTokens: usage.ai_tokens,
        previewMinutes: usage.preview_minutes,
        sandboxRuns: usage.sandbox_runs,
        deployments: usage.deployments
      },
      planName
    )

    // Get current period
    const currentMonth = new Date()
    const period = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`

    // Check if in trial
    const isTrial = user.trialEndsAt && new Date(user.trialEndsAt) > new Date()
    const trialDaysRemaining = isTrial && user.trialEndsAt
      ? Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null

    return NextResponse.json({
      plan: {
        name: user.plan,
        displayName: user.plan.charAt(0) + user.plan.slice(1).toLowerCase(),
        limits,
        isTrial,
        trialDaysRemaining,
        paymentStatus: user.paymentStatus
      },
      usage: {
        aiTokens: usage.ai_tokens,
        previewMinutes: usage.preview_minutes,
        sandboxRuns: usage.sandbox_runs,
        deployments: usage.deployments,
        period
      },
      usagePercentage,
      exceeded,
      canUpgrade: planName !== 'enterprise'
    })
  } catch (error) {
    console.error('Error fetching usage limits:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    )
  }
}


