import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { GitHubService } from '@/lib/integrations/github-service'

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
    const { branchName, title, description, baseBranch } = await request.json()

    if (!branchName) {
      return NextResponse.json(
        { error: 'Branch name is required' },
        { status: 400 }
      )
    }

    // Get project and check GitHub integration
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get GitHub repo from project context
    const context = project.context as any
    const repoFullName = context?.githubRepo

    if (!repoFullName) {
      return NextResponse.json(
        { error: 'Project not linked to GitHub repository. Please link a repository first.' },
        { status: 400 }
      )
    }

    // Check if GitHub is connected
    const integration = await prisma.integration.findFirst({
      where: {
        userId: session.user.id,
        provider: 'github',
        connectionState: 'connected'
      }
    })

    if (!integration) {
      return NextResponse.json(
        { error: 'GitHub not connected. Please connect GitHub in settings.' },
        { status: 400 }
      )
    }

    // Create pull request
    const pr = await GitHubService.createPullRequest(
      session.user.id,
      repoFullName,
      title || `[AI] ${branchName}`,
      description || 'AI-generated changes via DevFlowHub Editor',
      branchName,
      baseBranch || 'main'
    )

    return NextResponse.json({
      pr,
      message: 'Pull request created successfully'
    })

  } catch (error) {
    console.error('Error creating PR:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
