import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { SubscriptionService } from '@/lib/subscription-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin (you can implement your own admin check logic)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, we'll allow any authenticated user to access admin analytics
    // In production, you should implement proper admin role checking
    // const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    // if (!user?.isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    // }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    // Get revenue analytics
    const revenueAnalytics = await SubscriptionService.getRevenueAnalytics(start, end)

    // Get subscription statistics
    const subscriptionStats = await prisma.razorpaySubscription.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    // Get user plan distribution
    const userPlanStats = await prisma.user.groupBy({
      by: ['plan', 'paymentStatus'],
      _count: {
        plan: true
      }
    })

    // Get recent payments
    const recentPayments = await prisma.razorpayPayment.findMany({
      where: {
        status: 'paid',
        ...(start && end ? {
          createdAt: {
            gte: start,
            lte: end
          }
        } : {})
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get monthly revenue trend (last 12 months)
    const monthlyRevenue = await prisma.razorpayPayment.groupBy({
      by: ['createdAt'],
      where: {
        status: 'paid',
        createdAt: {
          gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) // Last 12 months
        }
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    return NextResponse.json({
      revenue: revenueAnalytics,
      subscriptions: subscriptionStats,
      userPlans: userPlanStats,
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100, // Convert paise to rupees
        currency: payment.currency,
        plan: payment.plan,
        status: payment.status,
        createdAt: payment.createdAt,
        user: {
          name: payment.user.name,
          email: payment.user.email
        }
      })),
      monthlyTrend: monthlyRevenue.map(item => ({
        month: item.createdAt.toISOString().slice(0, 7), // YYYY-MM format
        revenue: (item._sum.amount || 0) / 100,
        payments: item._count.id
      }))
    })

  } catch (error) {
    console.error('Error fetching admin revenue data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
