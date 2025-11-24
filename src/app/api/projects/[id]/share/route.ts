import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// POST /api/projects/[id]/share - Generate a share token
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
    const { expiresInDays = 7 } = await request.json().catch(() => ({}))

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate a secure share token
    const shareToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Store share token in project context with terminal/logs recording enabled
    const context = (project.context as any) || {}
    context.shareToken = shareToken
    context.shareTokenExpiresAt = expiresAt.toISOString()
    context.shareEnabled = true
    context.shareIncludesTerminal = true // Include terminal output in share
    context.shareIncludesLogs = true // Include logs in share
    context.shareRecordedAt = new Date().toISOString()

    await prisma.project.update({
      where: { id: projectId },
      data: { context }
    })

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'share_link_created',
        description: 'Share link created',
        metadata: {
          expiresAt: expiresAt.toISOString(),
          expiresInDays
        }
      }
    })

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${shareToken}`

    return NextResponse.json({
      success: true,
      shareToken,
      shareUrl,
      expiresAt: expiresAt.toISOString()
    })
  } catch (error) {
    console.error('Error creating share link:', error)
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]/share - Revoke share token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Remove share token from context
    const context = (project.context as any) || {}
    delete context.shareToken
    delete context.shareTokenExpiresAt
    context.shareEnabled = false

    await prisma.project.update({
      where: { id: projectId },
      data: { context }
    })

    // Create activity
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'share_link_revoked',
        description: 'Share link revoked'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking share link:', error)
    return NextResponse.json(
      { error: 'Failed to revoke share link' },
      { status: 500 }
    )
  }
}

// GET /api/projects/[id]/share - Get share link info
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

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const context = (project.context as any) || {}
    const shareToken = context.shareToken
    const expiresAt = context.shareTokenExpiresAt
    const shareEnabled = context.shareEnabled || false

    if (!shareToken) {
      return NextResponse.json({
        shareEnabled: false,
        shareUrl: null,
        expiresAt: null
      })
    }

    // Check if expired
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return NextResponse.json({
        shareEnabled: false,
        shareUrl: null,
        expiresAt: null,
        expired: true
      })
    }

    const shareUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/share/${shareToken}`

    return NextResponse.json({
      shareEnabled,
      shareUrl,
      expiresAt
    })
  } catch (error) {
    console.error('Error fetching share link:', error)
    return NextResponse.json(
      { error: 'Failed to fetch share link' },
      { status: 500 }
    )
  }
}

