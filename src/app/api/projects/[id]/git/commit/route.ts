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

    const projectId = params.id
    const { branchName, message, author, changes } = await request.json()

    if (!branchName || !message || !changes) {
      return NextResponse.json({ 
        error: 'Branch name, message, and changes are required' 
      }, { status: 400 })
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

    const commitId = `commit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Log the commit
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'git',
        action: 'commit',
        metadata: { 
          commitId,
          branchName, 
          message, 
          author,
          filesChanged: changes.length
        }
      }
    })

    // In production, this would create an actual Git commit
    // For now, we'll store the commit info in the database
    const commit = {
      id: commitId,
      message,
      author: author || 'AI Assistant',
      timestamp: new Date().toISOString(),
      branch: branchName,
      files: changes.map((c: any) => c.path)
    }

    return NextResponse.json({ 
      success: true,
      commitId,
      commit,
      message: 'Changes committed successfully'
    })

  } catch (error) {
    console.error('Error committing changes:', error)
    return NextResponse.json(
      { error: 'Failed to commit changes' },
      { status: 500 }
    )
  }
}
