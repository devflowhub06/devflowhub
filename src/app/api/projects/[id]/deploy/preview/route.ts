import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeploymentPreview, DeploymentChange } from '@/components/modals/DeployPreviewModal'

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

    // Get project files to analyze changes
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' }
    })

    // Simulate deployment changes (in real implementation, this would compare with git)
    const changes: DeploymentChange[] = files.map(file => ({
      type: 'modified' as const,
      path: file.path,
      size: file.content.length,
      lastModified: file.updatedAt.toISOString(),
      preview: file.content.substring(0, 200) + (file.content.length > 200 ? '...' : '')
    }))

    // Create deployment preview
    const preview: DeploymentPreview = {
      id: `preview-${Date.now()}`,
      projectId,
      environment: 'staging',
      branch: 'main',
      commitMessage: `Deploy ${project.name} - ${new Date().toLocaleString()}`,
      changes,
      estimatedSize: files.reduce((total, file) => total + file.content.length, 0),
      estimatedTime: '2-3 minutes',
      previewUrl: `https://staging-${projectId}.devflowhub.app`,
      createdAt: new Date().toISOString(),
      status: 'ready'
    }

    // Log the preview creation
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'DEPLOYMENT_PREVIEW_CREATED',
        description: `Created deployment preview with ${changes.length} file changes`,
        metadata: {
          previewId: preview.id,
          changesCount: changes.length,
          estimatedSize: preview.estimatedSize
        }
      }
    })

    return NextResponse.json({ preview })
  } catch (error) {
    console.error('Error creating deployment preview:', error)
    return NextResponse.json(
      { error: 'Failed to create deployment preview' },
      { status: 500 }
    )
  }
}
