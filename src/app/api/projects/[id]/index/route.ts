import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/projects/[id]/index - Index project files for AI assistant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        files: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Extract key information from project files for AI context
    const projectMetadata = {
      id: project.id,
      name: project.name,
      description: project.description,
      language: project.language,
      framework: project.framework,
      type: project.type,
      createdAt: project.createdAt,
      filesCount: project.files.length,
      keyFiles: project.files
        .filter(file => 
          file.name.includes('package.json') ||
          file.name.includes('README') ||
          file.name.includes('index.') ||
          file.name.includes('main.') ||
          file.name.includes('App.') ||
          file.path.includes('src/')
        )
        .map(file => ({
          name: file.name,
          path: file.path,
          type: file.type,
          size: file.size,
          preview: file.content?.substring(0, 200) || ''
        }))
    }

    // TODO: Implement actual vector database indexing
    // For now, we'll store the metadata in the project context
    
    const embeddings = {
      projectMetadata,
      indexedAt: new Date().toISOString(),
      embeddingsCount: projectMetadata.keyFiles.length,
      vectorStoreId: `project-${projectId}-embeddings`
    }

    // Update project context with indexing information
    await prisma.project.update({
      where: { id: projectId },
      data: {
        context: {
          ...(project.context as any || {}),
          aiIndexing: {
            ...embeddings,
            indexed: true,
            lastIndexed: new Date().toISOString()
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      projectId,
      indexedFiles: projectMetadata.keyFiles.length,
      embeddings: embeddings
    })
  } catch (error) {
    console.error('Error indexing project:', error)
    return NextResponse.json(
      { error: 'Failed to index project' },
      { status: 500 }
    )
  }
}
