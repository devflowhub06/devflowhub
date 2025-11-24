import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// GET /api/preview/[projectId]/[previewId] - Get preview environment details
export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; previewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preview = await prisma.previewEnvironment.findFirst({
      where: {
        id: params.previewId,
        projectId: params.projectId,
        userId: session.user.id,
      },
    })

    if (!preview) {
      return NextResponse.json(
        { error: 'Preview environment not found' },
        { status: 404 }
      )
    }

    // Update last accessed time
    await prisma.previewEnvironment.update({
      where: { id: params.previewId },
      data: {
        lastAccessedAt: new Date(),
      },
    })

    return NextResponse.json({ preview })
  } catch (error) {
    console.error('Error fetching preview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    )
  }
}

// DELETE /api/preview/[projectId]/[previewId] - Destroy preview environment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string; previewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preview = await prisma.previewEnvironment.findFirst({
      where: {
        id: params.previewId,
        projectId: params.projectId,
        userId: session.user.id,
      },
    })

    if (!preview) {
      return NextResponse.json(
        { error: 'Preview environment not found' },
        { status: 404 }
      )
    }

    // Mark as inactive/destroyed
    await prisma.previewEnvironment.update({
      where: { id: params.previewId },
      data: {
        status: 'inactive',
        destroyedAt: new Date(),
      },
    })

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'preview_destroyed',
        eventType: 'user_action',
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          previewId: preview.id,
          branchName: preview.branchName,
          actualCost: preview.actualCost,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Preview environment destroyed',
    })
  } catch (error) {
    console.error('Error destroying preview:', error)
    return NextResponse.json(
      { error: 'Failed to destroy preview' },
      { status: 500 }
    )
  }
}

