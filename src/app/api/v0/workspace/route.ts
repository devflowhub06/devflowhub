import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      },
      include: {
        v0: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get components from V0 workspace
    const components = project.v0?.components || []

    return NextResponse.json({
      success: true,
      components
    })

  } catch (error) {
    console.error('Error fetching V0 workspace:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, component } = await request.json()

    if (!projectId || !component) {
      return NextResponse.json({ error: 'Project ID and component are required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      },
      include: {
        v0: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create or update V0 workspace
    let v0Workspace
    if (project.v0) {
      // Update existing workspace
      const updatedComponents = [...(project.v0.components as any[]), component]
      v0Workspace = await prisma.v0Workspace.update({
        where: { id: project.v0.id },
        data: {
          components: updatedComponents,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new workspace
      v0Workspace = await prisma.v0Workspace.create({
        data: {
          projectId,
          components: [component],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id || '',
        tool: 'V0',
        action: 'component_added',
        metadata: {
          componentName: component.name,
          componentPath: component.filePath
        }
      }
    })

    return NextResponse.json({
      success: true,
      v0Workspace,
      component
    })

  } catch (error) {
    console.error('Error updating V0 workspace:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
