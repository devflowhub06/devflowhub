import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentId = params.id

    const component = await prisma.componentLibraryEntry.findUnique({
      where: { id: componentId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        tags: true,
        code: true,
        props: true,
        variants: true,
        previewHtml: true,
        story: true,
        test: true,
        projectId: true,
        createdBy: true,
        visibility: true,
        version: true,
        downloads: true,
        likes: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 })
    }

    // Check access permissions
    if (component.visibility === 'private' && component.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (component.visibility === 'project' && component.projectId) {
      const project = await prisma.project.findUnique({
        where: { id: component.projectId },
        select: { userId: true }
      })
      
      if (!project || project.userId !== session.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    return NextResponse.json(component)

  } catch (error) {
    console.error('Get component API error:', error)
    return NextResponse.json(
      { error: 'Failed to get component', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentId = params.id

    // Check if component exists and user has permission
    const component = await prisma.componentLibraryEntry.findUnique({
      where: { id: componentId },
      select: { createdBy: true }
    })

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 })
    }

    if (component.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete component
    await prisma.componentLibraryEntry.delete({
      where: { id: componentId }
    })

    return NextResponse.json({ message: 'Component deleted successfully' })

  } catch (error) {
    console.error('Delete component API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete component', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const componentId = params.id
    const updates = await request.json()

    // Check if component exists and user has permission
    const component = await prisma.componentLibraryEntry.findUnique({
      where: { id: componentId },
      select: { createdBy: true }
    })

    if (!component) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 })
    }

    if (component.createdBy !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Update component
    const updatedComponent = await prisma.componentLibraryEntry.update({
      where: { id: componentId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedComponent)

  } catch (error) {
    console.error('Update component API error:', error)
    return NextResponse.json(
      { error: 'Failed to update component', details: (error as Error).message },
      { status: 500 }
    )
  }
}
