import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/sessions - Get session history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

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

    // Get session history from project activities
    // Group activities by session (using time windows or explicit session markers)
    const activities = await prisma.projectActivity.findMany({
      where: { 
        projectId,
        type: {
          in: ['session_start', 'session_end', 'file_edited', 'terminal_command', 'deployment', 'git_commit']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Group activities into sessions (sessions are periods of activity with gaps < 30 minutes)
    const sessions: Array<{
      id: string
      startTime: string
      endTime: string | null
      duration: number
      activities: number
      types: string[]
    }> = []

    let currentSession: {
      id: string
      startTime: string
      endTime: string | null
      activities: typeof activities
      types: Set<string>
    } | null = null

    for (const activity of activities.reverse()) {
      if (activity.type === 'session_start') {
        // Start new session
        if (currentSession) {
          sessions.push({
            id: currentSession.id,
            startTime: currentSession.startTime,
            endTime: currentSession.endTime || new Date().toISOString(),
            duration: currentSession.endTime 
              ? new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime()
              : Date.now() - new Date(currentSession.startTime).getTime(),
            activities: currentSession.activities.length,
            types: Array.from(currentSession.types)
          })
        }
        currentSession = {
          id: activity.id,
          startTime: activity.createdAt.toISOString(),
          endTime: null,
          activities: [activity],
          types: new Set([activity.type])
        }
      } else if (activity.type === 'session_end' && currentSession) {
        // End current session
        currentSession.endTime = activity.createdAt.toISOString()
        currentSession.activities.push(activity)
        currentSession.types.add(activity.type)
      } else if (currentSession) {
        // Add activity to current session
        currentSession.activities.push(activity)
        currentSession.types.add(activity.type)
        
        // Check if gap is too large (30 minutes)
        const lastActivityTime = new Date(currentSession.activities[currentSession.activities.length - 2]?.createdAt || currentSession.startTime).getTime()
        const currentActivityTime = new Date(activity.createdAt).getTime()
        const gapMinutes = (currentActivityTime - lastActivityTime) / (1000 * 60)
        
        if (gapMinutes > 30) {
          // End session due to inactivity
          currentSession.endTime = new Date(lastActivityTime).toISOString()
          sessions.push({
            id: currentSession.id,
            startTime: currentSession.startTime,
            endTime: currentSession.endTime,
            duration: new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime(),
            activities: currentSession.activities.length - 1, // Exclude the gap activity
            types: Array.from(currentSession.types)
          })
          currentSession = null
        }
      } else {
        // Create implicit session for orphaned activity
        currentSession = {
          id: activity.id,
          startTime: activity.createdAt.toISOString(),
          endTime: null,
          activities: [activity],
          types: new Set([activity.type])
        }
      }
    }

    // Add final session if exists
    if (currentSession) {
      sessions.push({
        id: currentSession.id,
        startTime: currentSession.startTime,
        endTime: currentSession.endTime || new Date().toISOString(),
        duration: currentSession.endTime 
          ? new Date(currentSession.endTime).getTime() - new Date(currentSession.startTime).getTime()
          : Date.now() - new Date(currentSession.startTime).getTime(),
        activities: currentSession.activities.length,
        types: Array.from(currentSession.types)
      })
    }

    return NextResponse.json({ 
      sessions: sessions.reverse(), // Most recent first
      total: sessions.length 
    })
  } catch (error) {
    console.error('Error fetching session history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session history' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/sessions - Start a new session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

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

    // Create session start activity
    const activity = await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'session_start',
        description: 'Workspace session started',
        metadata: {
          userId: session.user.id,
          timestamp: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      sessionId: activity.id,
      startedAt: activity.createdAt
    })
  } catch (error) {
    console.error('Error starting session:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}

