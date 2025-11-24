import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { GitHubService } from '@/lib/integrations/github-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const repos = await GitHubService.listRepositories(session.user.id)
    return NextResponse.json({ repos })
  } catch (error) {
    console.error('Error listing GitHub repos:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to list repositories'
    
    // Return 401 if GitHub is not connected
    if (errorMessage.includes('not connected') || errorMessage.includes('GitHub not connected')) {
      return NextResponse.json(
        { error: 'GitHub is not connected. Please connect GitHub in Settings first.' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


