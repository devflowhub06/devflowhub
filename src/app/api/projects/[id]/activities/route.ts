import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Define valid tool types based on Prisma schema
const VALID_TOOLS = ['REPLIT', 'CURSOR', 'V0', 'BOLT'] as const
type ValidTool = typeof VALID_TOOLS[number]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id,
        userId: session.user.id 
      }
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get project activities
    const activities = await prisma.projectActivity.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 activities
    })
    
    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      metadata: activity.metadata,
      createdAt: activity.createdAt
    }))
    
    return NextResponse.json({ activities: formattedActivities })
  } catch (error) {
    console.error('Failed to fetch activities:', error)
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, tool, details, success, timeTaken } = await request.json()

    if (!type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate tool parameter if provided
    let validatedTool: ValidTool | undefined
    if (tool) {
      const normalizedTool = tool.toUpperCase()
      if (!VALID_TOOLS.includes(normalizedTool as ValidTool)) {
        return NextResponse.json({
          error: `Invalid tool. Must be one of: ${VALID_TOOLS.join(', ')}`
        }, { status: 400 })
      }
      validatedTool = normalizedTool as ValidTool
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create activity
    const activity = await prisma.projectActivity.create({
      data: {
        projectId: params.id,
        type,
        description: details || type,
        metadata: {
          tool: validatedTool,
          details,
          success,
          timeTaken,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Also log usage for analytics
    if (validatedTool) {
      await prisma.usageLog.create({
        data: {
          projectId: params.id,
          userId: session.user.id,
          tool: validatedTool,
          action: type,
          metadata: {
            details,
            success,
            timeTaken,
            timestamp: new Date().toISOString()
          }
        }
      })
    }

    return NextResponse.json({ success: true, activity })
  } catch (error: any) {
    console.error('Failed to create activity:', error)
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
  }
} 