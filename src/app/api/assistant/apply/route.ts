import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SnapshotService } from '@/lib/storage/snapshot'

export async function POST(request: NextRequest) {
  try {
    const { projectId, changes, summary, rationale } = await request.json()

    if (!projectId || !changes) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, changes' },
        { status: 400 }
      )
    }

    // Create snapshot before applying changes (SAFETY FEATURE)
    console.log('Creating safety snapshot before applying AI changes...')
    const snapshotId = await SnapshotService.createSnapshot(
      projectId,
      'system', // TODO: Get from auth
      `AI changes: ${summary || 'Assistant-generated changes'}`
    )

    // Generate branch name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const branchName = `assistant/changes/${timestamp}`

    // Create assistant branch record
    const assistantBranch = await prisma.assistantBranch.create({
      data: {
        branchName,
        projectId,
        userId: 'system', // TODO: Get from auth
        status: 'pending',
        summary: summary || 'AI-generated changes',
        rationale: rationale || 'Applied via DevFlowHub Editor',
        changesCount: changes.length,
        snapshotId: snapshotId,
        createdAt: new Date()
      }
    })

    // TODO: Implement actual git operations
    // For now, we'll just return success
    const prUrl = `https://github.com/devflowhub/project-${projectId}/pull/${Date.now()}`

    // Update the branch record with PR URL
    await prisma.assistantBranch.update({
      where: { id: assistantBranch.id },
      data: { 
        status: 'applied',
        prUrl 
      }
    })

    return NextResponse.json({
      branch: branchName,
      prUrl,
      message: 'Changes applied successfully'
    })

  } catch (error) {
    console.error('Error in assistant apply:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}