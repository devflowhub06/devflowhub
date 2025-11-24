import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    // Get local files from database
    const localFiles = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' }
    })

    // Simulate remote files (in real implementation, this would fetch from external provider)
    const remoteFiles = await getRemoteFiles(projectId)

    // Find conflicts
    const conflicts: Array<{
      path: string
      localContent: string
      remoteContent: string
      lastModified: {
        local: string
        remote: string
      }
      size: {
        local: number
        remote: number
      }
    }> = []

    for (const localFile of localFiles) {
      const remoteFile = remoteFiles.find(f => f.path === localFile.path)
      
      if (remoteFile && remoteFile.content !== localFile.content) {
        // Check if both files were modified recently (simulate conflict)
        const localModified = new Date(localFile.updatedAt)
        const remoteModified = new Date(remoteFile.lastModified)
        const timeDiff = Math.abs(localModified.getTime() - remoteModified.getTime())
        
        // If modified within 1 hour, consider it a conflict
        if (timeDiff < 60 * 60 * 1000) {
          conflicts.push({
            path: localFile.path,
            localContent: localFile.content,
            remoteContent: remoteFile.content,
            lastModified: {
              local: localFile.updatedAt.toISOString(),
              remote: remoteFile.lastModified.toISOString()
            },
            size: {
              local: localFile.content.length,
              remote: remoteFile.content.length
            }
          })
        }
      }
    }

    if (conflicts.length === 0) {
      return NextResponse.json({ conflict: null })
    }

    const conflict = {
      id: `conflict-${Date.now()}`,
      projectId,
      files: conflicts,
      createdAt: new Date().toISOString(),
      status: 'pending' as const
    }

    return NextResponse.json({ conflict })
  } catch (error) {
    console.error('Error checking for conflicts:', error)
    return NextResponse.json(
      { error: 'Failed to check for conflicts' },
      { status: 500 }
    )
  }
}

// Simulate fetching remote files
async function getRemoteFiles(projectId: string) {
  // In a real implementation, this would fetch from the external provider
  // For now, we'll simulate some conflicts by modifying a few files
  const localFiles = await prisma.projectFile.findMany({
    where: { projectId }
  })

  return localFiles.map(file => ({
    path: file.path,
    content: file.content + '\n// Remote modification',
    lastModified: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
  }))
}
