import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SnapshotService } from '@/lib/storage/snapshot'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params
    const { description = 'Manual snapshot' } = await request.json()

    // Validate project exists and user has access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        userId: true 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create snapshot
    const snapshotId = await SnapshotService.createSnapshot(
      projectId,
      session.user.id,
      description
    )

    return NextResponse.json({
      snapshotId,
      description,
      createdAt: new Date(),
      message: 'Snapshot created successfully'
    })

  } catch (error) {
    console.error('Snapshot creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    // Get all snapshots for project (mock data for now)
    const mockSnapshots = [
      {
        id: `snapshot-${Date.now()}`,
        projectId,
        description: 'Pre-deployment snapshot',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
        size: '12.5 MB'
      },
      {
        id: `snapshot-${Date.now() - 1000}`,
        projectId,
        description: 'Before AI changes',
        createdAt: new Date(Date.now() - 7200000), // 2 hours ago
        size: '11.8 MB'
      }
    ]

    return NextResponse.json({ snapshots: mockSnapshots })

  } catch (error) {
    console.error('Snapshot list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
}
