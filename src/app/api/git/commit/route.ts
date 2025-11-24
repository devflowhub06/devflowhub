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
    const { projectId, message, files } = body

    if (!projectId || !message) {
      return NextResponse.json({ error: 'Missing projectId or message' }, { status: 400 })
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

    // Generate a mock commit hash
    const commitHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Simulate Git commit output
    const commitOutput = `[main ${commitHash}] ${message}
 ${files ? files.length : 1} file(s) changed
 Author: ${user.name || user.email}
 Date: ${new Date().toISOString()}

${message}`

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: user.id,
        tool: 'CURSOR',
        action: 'git_commit',
        metadata: {
          commitHash,
          message,
          filesCount: files ? files.length : 1,
          author: user.name || user.email
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Commit created successfully',
      commit: {
        hash: commitHash,
        message,
        author: user.name || user.email,
        date: new Date().toISOString(),
        files: files || []
      },
      output: commitOutput
    })

  } catch (error) {
    console.error('Error creating Git commit:', error)
    return NextResponse.json(
      { error: 'Failed to create Git commit' },
      { status: 500 }
    )
  }
}
