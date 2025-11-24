import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const { activeTool } = await request.json()

    // Validate activeTool
    const validTools = ['REPLIT', 'CURSOR', 'V0', 'BOLT']
    if (!validTools.includes(activeTool)) {
      return NextResponse.json({ error: 'Invalid tool type' }, { status: 400 })
    }

    // Update project's active tool
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { activeTool },
      select: {
        id: true,
        name: true,
        activeTool: true,
        updatedAt: true
      }
    })

    // Log the tool switch
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: activeTool.toLowerCase(),
        action: 'tool_switch',
        metadata: {
          fromTool: 'unknown', // We don't track previous tool in this simple implementation
          toTool: activeTool.toLowerCase()
        }
      }
    })

    return NextResponse.json({
      success: true,
      project: updatedProject
    })

  } catch (error) {
    console.error('Error updating active tool:', error)
    return NextResponse.json(
      { error: 'Failed to update active tool' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Get project's active tool
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        activeTool: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      activeTool: project.activeTool
    })

  } catch (error) {
    console.error('Error getting active tool:', error)
    return NextResponse.json(
      { error: 'Failed to get active tool' },
      { status: 500 }
    )
  }
}
