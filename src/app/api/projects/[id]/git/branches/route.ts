import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
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

    const projectId = params.id

    // Verify project access
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ 
        error: 'Project not found or access denied' 
      }, { status: 404 })
    }

    // For now, return mock branches - in production this would integrate with actual Git
    const branches = [
      {
        name: 'main',
        isCurrent: true,
        lastCommit: {
          id: 'main-commit-1',
          message: 'Initial commit',
          author: 'User',
          timestamp: new Date().toISOString(),
          files: []
        }
      }
    ]

    return NextResponse.json({ branches })

  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
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
    const { branchName, fromBranch = 'main' } = await request.json()

    if (!branchName) {
      return NextResponse.json({ error: 'Branch name is required' }, { status: 400 })
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ 
        error: 'Project not found or access denied' 
      }, { status: 404 })
    }

    // Log branch creation
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'git',
        action: 'create_branch',
        metadata: { branchName, fromBranch }
      }
    })

    // In production, this would create an actual Git branch
    return NextResponse.json({ 
      success: true,
      branchName,
      message: 'Branch created successfully'
    })

  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Failed to create branch' },
      { status: 500 }
    )
  }
}
