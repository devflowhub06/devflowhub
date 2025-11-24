import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params
    const { branchName, fromBranch = 'main' } = await request.json()

    if (!branchName) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      )
    }

    // Get project information
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, userId: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Create assistant branch record in database
    const assistantBranch = await prisma.assistantBranch.create({
      data: {
        projectId,
        branchName,
        status: 'created',
        summary: `Branch created: ${branchName}`,
        rationale: `Created from ${fromBranch}`,
        changesCount: 0,
        userId: project.userId
      }
    })

    const newBranch = {
      id: assistantBranch.id,
      name: branchName,
      from: fromBranch,
      createdAt: assistantBranch.createdAt.toISOString(),
      status: 'created'
    }

    return NextResponse.json({
      branch: newBranch,
      message: 'Branch created successfully'
    })

  } catch (error) {
    console.error('Error creating branch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
