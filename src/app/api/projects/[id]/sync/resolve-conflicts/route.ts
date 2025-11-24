import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ConflictResolution } from '@/components/modals/SyncConflictModal'

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
    const resolution: ConflictResolution = await request.json()

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create backup before resolving conflicts
    await createBackup(projectId)

    // Resolve conflicts based on user choices
    await resolveFileConflicts(projectId, resolution)

    // Log the resolution
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'SYNC_CONFLICTS_RESOLVED',
        description: `Resolved ${Object.keys(resolution.fileResolutions).length} file conflicts`,
        metadata: {
          resolutions: resolution.fileResolutions,
          customMerges: resolution.customMerges || {}
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error resolving conflicts:', error)
    return NextResponse.json(
      { error: 'Failed to resolve conflicts' },
      { status: 500 }
    )
  }
}

async function createBackup(projectId: string) {
  // Create a backup of current state
  const files = await prisma.projectFile.findMany({
    where: { projectId }
  })

  await prisma.projectBackup.create({
    data: {
      projectId,
      backupData: {
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          type: f.type,
          name: f.name
        })),
        timestamp: new Date().toISOString()
      }
    }
  })
}

async function resolveFileConflicts(projectId: string, resolution: ConflictResolution) {
  const { fileResolutions, customMerges } = resolution

  for (const [filePath, resolutionType] of Object.entries(fileResolutions)) {
    const file = await prisma.projectFile.findFirst({
      where: {
        projectId,
        path: filePath
      }
    })

    if (!file) continue

    let newContent = file.content

    switch (resolutionType) {
      case 'keep-local':
        // Keep current content (no change needed)
        break
        
      case 'keep-remote':
        // Update with remote content (simulated)
        newContent = file.content + '\n// Remote version applied'
        break
        
      case 'merge':
        // Use custom merge if provided, otherwise combine both
        if (customMerges && customMerges[filePath]) {
          newContent = customMerges[filePath]
        } else {
          newContent = `// Merged content\n${file.content}\n// --- Remote changes ---\n${file.content}\n// End merge`
        }
        break
    }

    // Update the file
    await prisma.projectFile.update({
      where: { id: file.id },
      data: {
        content: newContent,
        updatedAt: new Date()
      }
    })
  }
}
