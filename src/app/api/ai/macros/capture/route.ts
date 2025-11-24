import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

interface CapturedAction {
  timestamp: string
  tool: 'editor' | 'sandbox' | 'ui_studio' | 'deployer'
  action: string
  type: 'ai_suggestion' | 'file_edit' | 'command' | 'deploy' | 'test'
  parameters: Record<string, any>
  result?: any
}

// POST /api/ai/macros/capture - Save captured session as a macro
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, projectId, actions } = body

    if (!name || !actions || !Array.isArray(actions)) {
      return NextResponse.json(
        { error: 'Name and actions are required' },
        { status: 400 }
      )
    }

    // Convert captured actions to macro steps
    const steps = actions.map((action: CapturedAction) => ({
      type: action.type,
      tool: action.tool,
      action: action.action,
      parameters: action.parameters,
      timestamp: action.timestamp,
    }))

    // Create macro from captured session
    const macro = await prisma.aIMacro.create({
      data: {
        name,
        description: description || `Auto-generated from session on ${new Date().toLocaleDateString()}`,
        userId: session.user.id,
        projectId: projectId || null,
        steps,
      },
    })

    // Track macro creation
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'ai_macro_captured',
        eventType: 'ai_event',
        userId: session.user.id,
        projectId: projectId || null,
        metadata: {
          macroId: macro.id,
          actionCount: actions.length,
          captureMethod: 'session',
        },
      },
    })

    return NextResponse.json({
      macro,
      message: `Successfully captured ${actions.length} actions as a macro`,
    })
  } catch (error) {
    console.error('Error capturing macro:', error)
    return NextResponse.json(
      { error: 'Failed to capture macro' },
      { status: 500 }
    )
  }
}

// GET /api/ai/macros/capture - Get current session actions (from memory/cache)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    // This would retrieve from a session store (Redis, etc.)
    // For now, return empty array as placeholder
    const capturedActions: CapturedAction[] = []

    return NextResponse.json({
      sessionId: sessionId || new Date().toISOString(),
      actions: capturedActions,
      count: capturedActions.length,
    })
  } catch (error) {
    console.error('Error getting captured actions:', error)
    return NextResponse.json(
      { error: 'Failed to get captured actions' },
      { status: 500 }
    )
  }
}

