import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// Store active preview sessions
const previewSessions = new Map<string, {
  port: number
  projectId: string
  url: string
  createdAt: number
}>()

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

    const previewSession = previewSessions.get(projectId)

    if (!previewSession) {
      return NextResponse.json({ 
        running: false,
        message: 'No preview session found. Start your project with npm run dev' 
      })
    }

    return NextResponse.json({
      running: true,
      port: previewSession.port,
      url: previewSession.url,
      previewUrl: `/api/projects/${projectId}/preview/proxy`
    })

  } catch (error) {
    console.error('Preview status error:', error)
    return NextResponse.json(
      { error: 'Failed to get preview status' },
      { status: 500 }
    )
  }
}

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
    const { port, url } = await request.json()

    if (!port) {
      return NextResponse.json({ error: 'Port required' }, { status: 400 })
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

    // Store preview session
    previewSessions.set(projectId, {
      port: parseInt(port),
      projectId,
      url: url || `http://localhost:${port}`,
      createdAt: Date.now()
    })

    return NextResponse.json({
      success: true,
      previewUrl: `/api/projects/${projectId}/preview/proxy`,
      message: `Preview available on port ${port}`
    })

  } catch (error) {
    console.error('Preview registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register preview' },
      { status: 500 }
    )
  }
}

// Proxy endpoint to serve the running application
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    previewSessions.delete(projectId)

    return NextResponse.json({ success: true, message: 'Preview session stopped' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to stop preview' },
      { status: 500 }
    )
  }
}

