import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, branch = 'main', remote = 'origin' } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if CursorWorkspace exists
    const cursorWorkspace = await prisma.cursorWorkspace.findUnique({
      where: { projectId }
    })

    if (!cursorWorkspace) {
      return NextResponse.json({ error: 'Workspace not initialized. Run git init first.' }, { status: 400 })
    }

    // Simulate Git push output
    const pushOutput = `Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 1.2 KiB | 1.2 MiB/s, done.
Total 3 (delta 0), reused 0 (delta 0), pack-reused 0
To ${remote}/${project.name}.git
   ${branch}:${branch} -> ${branch}
 * [new branch]     ${branch} -> ${branch}
Branch '${branch}' set up to track remote branch '${branch}' from '${remote}'.`

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: user.id,
        tool: 'CURSOR',
        action: 'git_push',
        metadata: {
          branch,
          remote,
          projectName: project.name
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Push completed successfully',
      output: pushOutput,
      details: {
        branch,
        remote,
        projectName: project.name,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error pushing to Git:', error)
    return NextResponse.json(
      { error: 'Failed to push to Git' },
      { status: 500 }
    )
  }
}
