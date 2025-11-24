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
    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch') || 'main'
    const limit = parseInt(searchParams.get('limit') || '10')

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

    // Fetch commit history from usage logs
    const commits = await prisma.usageLog.findMany({
      where: {
        projectId,
        tool: 'git',
        action: 'commit'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    const commitHistory = commits.map(commit => ({
      id: commit.metadata?.commitId || commit.id,
      message: commit.metadata?.message || 'Commit',
      author: commit.metadata?.author || 'Unknown',
      timestamp: commit.createdAt.toISOString(),
      branch: commit.metadata?.branchName || branch,
      files: commit.metadata?.filesChanged || []
    }))

    return NextResponse.json({ 
      commits: commitHistory,
      branch,
      total: commitHistory.length
    })

  } catch (error) {
    console.error('Error fetching commit history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch commit history' },
      { status: 500 }
    )
  }
}
