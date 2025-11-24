import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/projects/[id]/seed - Seed files for a project
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
    const body = await request.json()
    const { files, templateId } = body

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Clear existing files
    await prisma.projectFile.deleteMany({
      where: { projectId }
    })

    // Create new files
    if (files && files.length > 0) {
      const filesData = files.map((file: any) => ({
        projectId,
        name: file.name || file.path.split('/').pop() || 'unknown',
        path: file.path,
        content: file.content,
        type: file.type || 'file',
        size: file.content?.length || 0
      }))

      await prisma.projectFile.createMany({
        data: filesData,
        skipDuplicates: true
      })
    }

    // Update project context
    await prisma.project.update({
      where: { id: projectId },
      data: {
        context: {
          ...(project.context as any || {}),
          templateId,
          seeded: true,
          filesCount: files?.length || 0,
          lastSeeded: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      filesCreated: files?.length || 0,
      projectId
    })
  } catch (error) {
    console.error('Error seeding project:', error)
    return NextResponse.json(
      { error: 'Failed to seed project' },
      { status: 500 }
    )
  }
}
