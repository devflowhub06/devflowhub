import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface AnalyticsEventPayload {
  eventName: string
  eventType: 'user_action' | 'system_event' | 'ai_event'
  projectId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

// POST /api/v2/analytics/ingest - Ingest analytics events
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Allow both authenticated and anonymous events
    const userId = session?.user?.id || null

    const body = await request.json()
    const events: AnalyticsEventPayload[] = Array.isArray(body) ? body : [body]

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     undefined

    // Batch insert events with graceful error handling
    let createdEvents;
    try {
      createdEvents = await prisma.analyticsEvent.createMany({
        data: events.map(event => ({
          eventName: event.eventName,
          eventType: event.eventType,
          userId,
          projectId: event.projectId,
          sessionId: event.sessionId,
          metadata: event.metadata || {},
          userAgent,
          ipAddress,
          timestamp: new Date(),
        })),
        skipDuplicates: true,
      })
    } catch (dbError: any) {
      // Log error but don't fail the request - analytics should never break the app
      console.error('Database error in analytics ingestion (non-fatal):', dbError?.message || dbError)
      
      // Return success to prevent client-side errors
      return NextResponse.json({
        success: true,
        count: 0,
        warning: 'Analytics temporarily unavailable - database migration pending',
      })
    }

    // Track funnel steps (with error handling)
    try {
      for (const event of events) {
        if (userId && event.projectId) {
          // Map events to funnel steps
          let step: string | null = null
          let stepOrder = 0

          if (event.eventName === 'project_created' || event.eventName === 'template_selected') {
            step = 'create'
            stepOrder = 1
          } else if (event.eventName === 'preview_started' || event.eventName === 'preview_opened') {
            step = 'preview'
            stepOrder = 2
          } else if (event.eventName === 'deploy_started' || event.eventName === 'deploy_succeeded') {
            step = 'deploy'
            stepOrder = 3
          }

          if (step) {
            await prisma.analyticsFunnel.upsert({
              where: {
                // Composite unique constraint would be ideal, but we'll use create/update
                id: `${userId}-${event.projectId}-${step}`,
              },
              create: {
                id: `${userId}-${event.projectId}-${step}`,
                userId,
                projectId: event.projectId,
                step,
                stepOrder,
                metadata: event.metadata || {},
              },
              update: {
                completedAt: new Date(),
                metadata: event.metadata || {},
              },
            })
          }
        }
      }
    } catch (funnelError: any) {
      // Log funnel errors but don't fail the request
      console.error('Funnel tracking error (non-fatal):', funnelError?.message || funnelError)
    }

    return NextResponse.json({
      success: true,
      count: createdEvents.count,
    })
  } catch (error) {
    console.error('Error ingesting analytics events:', error)
    return NextResponse.json(
      { error: 'Failed to ingest events' },
      { status: 500 }
    )
  }
}

// GET /api/v2/analytics/ingest - Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'analytics-ingestion' })
}

