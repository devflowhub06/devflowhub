import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET /api/projects/[id]/workspace-launch
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

    // Verify project exists and user owns it
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      select: {
        id: true,
        name: true,
        status: true,
        repoPath: true,
        repoCommit: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate workspace token
    const workspaceToken = jwt.sign(
      {
        projectId,
        userId: session.user.id,
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
      },
      process.env.JWT_SECRET || 'dev-secret-key'
    )

    // Store token in database for validation
    await prisma.workspaceToken.create({
      data: {
        projectId,
        userId: session.user.id,
        token: workspaceToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      }
    })

    // Clean up expired tokens
    await prisma.workspaceToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return NextResponse.json({
      success: true,
      workspaceUrl: `/dashboard/projects/${projectId}/workspace?module=editor&token=${workspaceToken}`,
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        repoPath: project.repoPath,
        repoCommit: project.repoCommit
      }
    })
  } catch (error) {
    console.error('Error generating workspace launch URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate workspace URL' },
      { status: 500 }
    )
  }
}
