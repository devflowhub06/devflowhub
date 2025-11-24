import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { GitHubService } from '@/lib/integrations/github-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, repoFullName } = await request.json()

    if (!projectId || !repoFullName) {
      return NextResponse.json(
        { error: 'Project ID and repository name are required' },
        { status: 400 }
      )
    }

    await GitHubService.linkRepository(projectId, session.user.id, repoFullName)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error linking GitHub repo:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to link repository' },
      { status: 500 }
    )
  }
}


