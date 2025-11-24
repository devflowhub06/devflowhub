import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { trackAnalytics } from '@/lib/analytics'

// GET /api/settings/billing - Get billing information
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get current plan and usage
    const [user, billingUsage, recentUsage] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          plan: true,
          createdAt: true
        }
      }),
      prisma.billingUsage.findFirst({
        where: { userId },
        orderBy: { period: 'desc' }
      }),
      prisma.billingUsage.findMany({
        where: { userId },
        orderBy: { period: 'desc' },
        take: 12 // Last 12 months
      })
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate usage for current period
    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM
    const currentUsage = billingUsage?.period === currentPeriod ? billingUsage : {
      aiTokensUsed: 0,
      previewMinutes: 0,
      sandboxesStarted: 0,
      deployments: 0,
      storageBytes: 0,
      cost: 0
    }

    // Get plan limits
    const planLimits = getPlanLimits(user.plan)

    return NextResponse.json({
      plan: {
        name: user.plan,
        limits: planLimits
      },
      usage: {
        current: currentUsage,
        history: recentUsage
      },
      billing: {
        nextBillingDate: getNextBillingDate(user.createdAt),
        amount: getPlanPrice(user.plan)
      }
    })
  } catch (error) {
    console.error('Error fetching billing info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}

// POST /api/settings/billing/subscribe - Start subscription flow
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['pro', 'team', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    // In production, integrate with Stripe here
    // For now, just update the user's plan
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan }
    })

    // Track analytics event
    await trackAnalytics(session.user.id, 'plan_upgraded', {
      newPlan: plan
    })

    // Log audit event
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'plan_upgraded',
        resourceType: 'user',
        resourceId: session.user.id,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        metadata: { newPlan: plan }
      }
    })

    return NextResponse.json({ 
      success: true,
      plan,
      checkoutUrl: null // In production, return Stripe checkout URL
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// Helper functions
function getPlanLimits(plan: string) {
  const limits = {
    free: {
      aiTokens: 10000,
      previewMinutes: 60,
      sandboxes: 5,
      deployments: 3,
      storageGB: 1,
      teamMembers: 1
    },
    pro: {
      aiTokens: 100000,
      previewMinutes: 600,
      sandboxes: 50,
      deployments: 30,
      storageGB: 10,
      teamMembers: 5
    },
    team: {
      aiTokens: 500000,
      previewMinutes: 3000,
      sandboxes: 250,
      deployments: 150,
      storageGB: 50,
      teamMembers: 25
    },
    enterprise: {
      aiTokens: -1, // unlimited
      previewMinutes: -1,
      sandboxes: -1,
      deployments: -1,
      storageGB: -1,
      teamMembers: -1
    }
  }

  return limits[plan as keyof typeof limits] || limits.free
}

function getPlanPrice(plan: string) {
  const prices = {
    free: 0,
    pro: 29,
    team: 99,
    enterprise: 299
  }

  return prices[plan as keyof typeof prices] || 0
}

function getNextBillingDate(createdAt: Date) {
  const nextMonth = new Date(createdAt)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  return nextMonth.toISOString()
}
