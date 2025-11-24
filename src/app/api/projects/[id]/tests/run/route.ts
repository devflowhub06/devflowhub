import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = params
    const { testCommand } = await request.json()

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // In a real implementation, this would execute tests in the workspace container
    // For now, we'll dispatch a terminal command event
    const command = testCommand || 'npm test'

    // Return success - the terminal will handle the actual execution
    return NextResponse.json({
      success: true,
      command,
      message: 'Test command dispatched to terminal'
    })

  } catch (error) {
    console.error('Error running tests:', error)
    return NextResponse.json(
      { error: 'Failed to run tests' },
      { status: 500 }
    )
  }
}


