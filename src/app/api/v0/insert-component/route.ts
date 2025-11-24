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
    const { projectId, component, filePath } = body

    if (!projectId || !component || !filePath) {
      return NextResponse.json(
        { error: 'Missing required fields: projectId, component, filePath' },
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
        where: {
          projectId_path: {
            projectId,
            path: filePath
          }
        },
        data: {
          content: component.code,
          metadata: {
            size: component.code.length,
            lastModified: new Date().toISOString(),
            toolSource: 'v0'
          }
        }
      })
    } else {
      // Create new file
      await prisma.projectFile.create({
        data: {
          projectId,
          name: filePath.split('/').pop() || filePath,
          path: filePath,
          content: component.code,
          metadata: {
            size: component.code.length,
            toolSource: 'v0'
          }
        }
      })
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: user.id,
                  tool: 'V0',
        action: 'component_inserted',
        metadata: {
          componentName: component.name,
          filePath,
          framework: component.framework,
          fileSize: component.code.length
        }
      }
    })

    return NextResponse.json({
      success: true,
      filePath,
      message: `Component ${component.name} inserted successfully`
    })

  } catch (error) {
    console.error('Error inserting component:', error)
    return NextResponse.json(
      { error: 'Failed to insert component into project' },
      { status: 500 }
    )
  }
}
