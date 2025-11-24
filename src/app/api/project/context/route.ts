import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Get project with all related data
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      },
      include: {
        files: {
          orderBy: { updatedAt: 'desc' }
        },
        usageLogs: {
          take: 50,
          orderBy: { createdAt: 'desc' }
        },
        collaborationSessions: {
          where: { 
            endTime: null // Only active sessions (no end time)
          },
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get recent activities
    const recentActivities = await prisma.projectActivity.findMany({
      where: { projectId },
      take: 20,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        type: project.type,
        language: project.language,
        framework: project.framework,
        complexity: project.complexity,
        selectedTool: project.selectedTool,
        status: project.status,
        context: project.context,
        currentTool: project.currentTool,
        lastUsedTool: project.lastUsedTool,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
      },
      files: project.files,
      usageLogs: project.usageLogs,
      collaborationSessions: project.collaborationSessions,
      recentActivities,
      lastSync: new Date().toISOString()
    })

  } catch (error) {
    console.error('Project context GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      projectId,
      action,
      data,
      tool,
      filePath,
      content,
      metadata
    } = body

    if (!projectId || !action) {
      return NextResponse.json({ error: 'Project ID and action are required' }, { status: 400 })
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    let result: any = {}

    switch (action) {
      case 'update_file':
        if (!filePath || content === undefined) {
          return NextResponse.json({ error: 'File path and content are required' }, { status: 400 })
        }

        result = await prisma.projectFile.upsert({
          where: {
            projectId_path: {
              projectId,
              path: filePath
            }
          },
          update: {
            content,
            metadata: {
              size: Buffer.byteLength(content, 'utf8'),
              lastModified: new Date().toISOString(),
              lastSynced: new Date().toISOString(),
              toolSource: tool
            }
          },
          create: {
            projectId,
            name: filePath.split('/').pop() || filePath,
            path: filePath,
            content,
            metadata: {
              size: Buffer.byteLength(content, 'utf8'),
              lastModified: new Date().toISOString(),
              lastSynced: new Date().toISOString(),
              toolSource: tool
            }
          }
        })

        // Log the file update
        await prisma.usageLog.create({
          data: {
            projectId,
            userId: session.user.id,
            tool: tool || 'unknown',
            action: 'file_edit',
            metadata: {
              filePath,
              fileSize: Buffer.byteLength(content, 'utf8'),
              ...metadata
            }
          }
        })
        break

      case 'delete_file':
        if (!filePath) {
          return NextResponse.json({ error: 'File path is required' }, { status: 400 })
        }

        await prisma.projectFile.deleteMany({
          where: {
            projectId,
            path: filePath
          }
        })

        // Log the file deletion
        await prisma.usageLog.create({
          data: {
            projectId,
            userId: session.user.id,
            tool: tool || 'unknown',
            action: 'file_delete',
            metadata: {
              filePath,
              ...metadata
            }
          }
        })
        break

      case 'update_project':
        if (!data) {
          return NextResponse.json({ error: 'Project data is required' }, { status: 400 })
        }

        result = await prisma.project.update({
          where: { id: projectId },
          data: {
            ...data,
            updatedAt: new Date()
          }
        })
        break

      case 'join_collaboration':
        const sessionId = metadata?.sessionId || `session_${Date.now()}`
        
        result = await prisma.collaborationSession.upsert({
          where: {
            id: `session_${session.user.id}_${Date.now()}`
          },
          update: {
            notes: `Active session - ${metadata?.activeFile || 'No file'} - ${new Date().toISOString()}`,
          },
          create: {
            projectId,
            userId: session.user.id,
            sessionType: 'pair_programming',
            notes: `Active session - ${metadata?.activeFile || 'No file'} - ${new Date().toISOString()}`,
          }
        })
        break

      case 'leave_collaboration':
        const leaveSessionId = metadata?.sessionId
        if (leaveSessionId) {
                  await prisma.collaborationSession.updateMany({
          where: {
            id: leaveSessionId,
            userId: session.user.id
          },
                      data: {
              endTime: new Date(),
              notes: `Session ended - ${new Date().toISOString()}`,
            }
        })
        }
        break

      case 'update_cursor':
        const cursorSessionId = metadata?.sessionId
        if (cursorSessionId) {
                  result = await prisma.collaborationSession.updateMany({
          where: {
            id: cursorSessionId,
            userId: session.user.id
          },
                      data: {
              notes: `Active session - ${metadata?.activeFile || 'No file'} - ${new Date().toISOString()}`,
            }
        })
        }
        break

      case 'log_usage':
        await prisma.usageLog.create({
          data: {
            projectId,
            userId: session.user.id,
            tool: tool || 'unknown',
            action: metadata?.action || 'unknown',
            durationMs: metadata?.duration,
            metadata: metadata
          }
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update project's last activity
    await prisma.project.update({
      where: { id: projectId },
      data: {
        updatedAt: new Date(),
        currentTool: tool || project.currentTool
      }
    })

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Project context POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
