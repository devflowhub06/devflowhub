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

    const { projectId, command } = await request.json()

    if (!projectId || !command) {
      return NextResponse.json({ error: 'Project ID and command are required' }, { status: 400 })
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

    // Security: Only allow safe commands
    const safeCommands = ['ls', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'npm', 'node', 'git']
    const commandParts = command.trim().split(' ')
    const baseCommand = commandParts[0]

    if (!safeCommands.includes(baseCommand)) {
      return NextResponse.json({ 
        error: 'Command not allowed for security reasons',
        allowedCommands: safeCommands
      }, { status: 403 })
    }

    // Execute command in project directory
    const projectDir = `./projects/${projectId}`
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: projectDir,
        timeout: 30000 // 30 second timeout
      })

      const output = stderr ? `${stdout}\n${stderr}` : stdout

      // Log usage
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id || '',
          tool: 'CURSOR',
          action: 'terminal_command',
          metadata: {
            command,
            outputLength: output.length,
            hasError: !!stderr
          }
        }
      })

      return NextResponse.json({
        success: true,
        output: output || 'Command executed successfully',
        command,
        hasError: !!stderr
      })

    } catch (execError: any) {
      // Log usage for failed commands
      await prisma.usageLog.create({
        data: {
          projectId,
          userId: session.user.id || '',
          tool: 'CURSOR',
          action: 'terminal_command_failed',
          metadata: {
            command,
            error: execError.message
          }
        }
      })

      return NextResponse.json({
        success: false,
        output: `Error: ${execError.message}`,
        command,
        hasError: true
      })
    }

  } catch (error) {
    console.error('Error executing terminal command:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
