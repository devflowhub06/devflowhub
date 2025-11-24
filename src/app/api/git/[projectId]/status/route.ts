import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Mock git status for now
    const mockGitStatus = {
      currentBranch: 'main',
      lastCommit: 'a1b2c3d4e5f6789012345678901234567890abcd',
      lastSynced: new Date().toISOString(),
      hasChanges: false,
      unstagedFiles: [],
      stagedFiles: []
    }

    return NextResponse.json(mockGitStatus)

  } catch (error) {
    console.error('Git status error:', error)
    return NextResponse.json(
      { error: 'Failed to get git status' },
      { status: 500 }
    )
  }
}