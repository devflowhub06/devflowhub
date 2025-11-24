import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const prisma = new PrismaClient()
const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Initialize Git repository
    const projectDir = `./projects/${projectId}`
    
    try {
      // Check if Git is already initialized
      const { stdout: gitStatus } = await execAsync('git status', { cwd: projectDir })
      
      if (gitStatus.includes('fatal: not a git repository')) {
        // Initialize new Git repository
        await execAsync('git init', { cwd: projectDir })
        await execAsync('git add .', { cwd: projectDir })
        await execAsync('git commit -m "Initial commit"', { cwd: projectDir })
        
        const output = 'Git repository initialized successfully with initial commit'
        
        // Log usage
        await prisma.usageLog.create({
          data: {
            projectId,
            userId: session.user.id || '',
            tool: 'CURSOR',
            action: 'git_init',
            metadata: {
              action: 'initialized',
              hasInitialCommit: true
            }
          }
        })

        return NextResponse.json({
          success: true,
          output,
          action: 'initialized'
        })
      } else {
        // Git already initialized
        return NextResponse.json({
          success: true,
          output: 'Git repository already exists',
          action: 'already_exists'
        })
      }

    } catch (execError: any) {
      // Log usage for failed operations
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id || '',
          tool: 'CURSOR',
          action: 'git_init_failed',
          metadata: {
            error: execError.message
          }
        }
      })

      return NextResponse.json({
        success: false,
        output: `Git initialization failed: ${execError.message}`,
        action: 'failed'
      })
    }

  } catch (error) {
    console.error('Error initializing Git repository:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
