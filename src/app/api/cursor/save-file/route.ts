import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, filePath, content, fileName } = body

    if (!projectId || !filePath || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, filePath, fileName' },
        { status: 400 }
      )
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Create or update project file
    const existingFile = await prisma.projectFile.findUnique({
      where: {
        projectId_path: {
          projectId,
          path: filePath
        }
      }
    })

    if (existingFile) {
      // Update existing file
      await prisma.projectFile.update({
        where: { id: existingFile.id },
        data: {
          content: content || ''
        }
      })
    } else {
      // Create new file
      await prisma.projectFile.create({
        data: {
          projectId,
          name: fileName,
          path: filePath,
          content: content || '',
          type: 'file'
        }
      })
    }

    // Log usage (but not for every autosave to avoid spam)
    const shouldLogUsage = Math.random() < 0.1 // Log 10% of saves
    if (shouldLogUsage) {
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: user.id,
          tool: 'CURSOR',
          action: 'file_edit',
          metadata: {
            fileName,
            filePath,
            fileSize: (content || '').length
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      filePath,
      message: `File ${fileName} saved successfully`
    })

  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    )
  }
}
