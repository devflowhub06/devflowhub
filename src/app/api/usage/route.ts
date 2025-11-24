import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Define valid tool types based on Prisma schema
const VALID_TOOLS = ['REPLIT', 'CURSOR', 'V0', 'BOLT'] as const
type ValidTool = typeof VALID_TOOLS[number]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, tool, action, durationMs, metadata } = await request.json()

    if (!projectId || !tool || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate tool parameter
    const normalizedTool = tool.toUpperCase()
    if (!VALID_TOOLS.includes(normalizedTool as ValidTool)) {
      return NextResponse.json({ 
        error: `Invalid tool. Must be one of: ${VALID_TOOLS.join(', ')}` 
      }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create usage log
    const usageLog = await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: normalizedTool as ValidTool,
        action,
        durationMs,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent')
        }
      }
    })

    // Update project context if this is a significant action
    if (['file_save', 'ai_generation', 'deployment', 'tool_switch'].includes(action)) {
      const currentContext = project.context as any || {}
      await prisma.project.update({
        where: { id: projectId },
        data: {
          context: {
            ...currentContext,
            lastActivity: new Date().toISOString(),
            [`${action}Count`]: (currentContext[`${action}Count`] || 0) + 1
          }
        }
      })
    }

    return NextResponse.json({ success: true, usageLog })
  } catch (error: any) {
    console.error('Failed to log usage:', error)
    return NextResponse.json({ error: 'Failed to log usage' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const tool = searchParams.get('tool')
    const action = searchParams.get('action')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = { userId: session.user.id }
    if (projectId) where.projectId = projectId
    if (tool) {
      const normalizedTool = tool.toUpperCase()
      if (VALID_TOOLS.includes(normalizedTool as ValidTool)) {
        where.tool = normalizedTool
      }
    }
    if (action) where.action = action

    const usageLogs = await prisma.usageLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        project: {
          select: { name: true, type: true }
        }
      }
    })

    return NextResponse.json({ success: true, usageLogs })
  } catch (error: any) {
    console.error('Failed to fetch usage logs:', error)
    return NextResponse.json({ error: 'Failed to fetch usage logs' }, { status: 500 })
  }
}