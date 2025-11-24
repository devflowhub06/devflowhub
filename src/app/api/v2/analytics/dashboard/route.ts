import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/v2/analytics/dashboard - Get analytics dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : new Date()

    const userId = session.user.id

    // Funnel metrics
    const funnelData = await prisma.analyticsFunnel.groupBy({
      by: ['step'],
      where: {
        userId,
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        step: 'asc',
      },
    })

    // Event counts by type
    const eventsByType = await prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    })

    // Top events
    const topEvents = await prisma.analyticsEvent.groupBy({
      by: ['eventName'],
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // AI Token Usage
    const aiUsage = await prisma.aITokenUsage.aggregate({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalTokens: true,
        cost: true,
      },
      _count: {
        id: true,
      },
    })

    // Template Usage
    const templateUsage = await prisma.templateUsage.groupBy({
      by: ['templateId', 'language', 'framework'],
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    // Preview Environments
    const previewStats = await prisma.previewEnvironment.aggregate({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        actualCost: true,
        estimatedCost: true,
      },
    })

    // AI Macros
    const macroStats = await prisma.aIMacroRun.groupBy({
      by: ['status', 'outcome'],
      where: {
        userId,
        startedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        tokenUsage: true,
        cost: true,
      },
    })

    // Time series data (events per day)
    const eventTimeSeries = await prisma.$queryRaw<Array<{date: Date, count: bigint}>>`
      SELECT 
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM "AnalyticsEvent"
      WHERE "userId" = ${userId}
        AND timestamp >= ${startDate}
        AND timestamp <= ${endDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `

    return NextResponse.json({
      funnel: {
        steps: funnelData.map(step => ({
          step: step.step,
          count: step._count.id,
        })),
        conversionRate: calculateConversionRate(funnelData),
      },
      events: {
        byType: eventsByType.map(e => ({
          type: e.eventType,
          count: e._count.id,
        })),
        topEvents: topEvents.map(e => ({
          name: e.eventName,
          count: e._count.id,
        })),
        timeSeries: eventTimeSeries.map(e => ({
          date: e.date,
          count: Number(e.count),
        })),
      },
      aiUsage: {
        totalTokens: aiUsage._sum.totalTokens || 0,
        totalCost: aiUsage._sum.cost || 0,
        requestCount: aiUsage._count.id,
        avgCostPerRequest: aiUsage._count.id > 0 
          ? (aiUsage._sum.cost || 0) / aiUsage._count.id 
          : 0,
      },
      templates: {
        usage: templateUsage.map(t => ({
          templateId: t.templateId,
          language: t.language,
          framework: t.framework,
          count: t._count.id,
        })),
      },
      previews: {
        count: previewStats._count.id,
        totalCost: previewStats._sum.actualCost || 0,
        estimatedCost: previewStats._sum.estimatedCost || 0,
      },
      macros: {
        runs: macroStats.map(m => ({
          status: m.status,
          outcome: m.outcome,
          count: m._count.id,
          totalTokens: m._sum.tokenUsage || 0,
          totalCost: m._sum.cost || 0,
        })),
      },
      dateRange: {
        start: startDate,
        end: endDate,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

function calculateConversionRate(funnelData: Array<{ step: string; _count: { id: number } }>): number {
  const createStep = funnelData.find(s => s.step === 'create')
  const deployStep = funnelData.find(s => s.step === 'deploy')
  
  if (!createStep || createStep._count.id === 0) return 0
  if (!deployStep) return 0
  
  return (deployStep._count.id / createStep._count.id) * 100
}

