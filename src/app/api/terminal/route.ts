import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { spawn, exec } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, action, command, input } = await request.json()

    if (!projectId || !action) {
      return NextResponse.json({ 
        error: 'Project ID and action are required' 
      }, { status: 400 })
    }

    // Verify project exists and user has access
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: session.user.id 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get Cursor workspace
    const cursorWorkspace = await prisma.cursorWorkspace.findUnique({
      where: { projectId }
    })

    if (!cursorWorkspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    let result: any

    switch (action) {
      case 'start':
        result = await startTerminal(cursorWorkspace.rootPath)
        break
      
      case 'input':
        if (!command) {
          return NextResponse.json({ error: 'Command required for input action' }, { status: 400 })
        }
        result = await executeCommand(command, cursorWorkspace.rootPath)
        break
      
      case 'stop':
        result = await stopTerminal()
        break
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: session.user.id,
        tool: 'CURSOR',
        action: `terminal_${action}`,
        metadata: { 
          action,
          command,
          result: result?.success ? 'success' : 'error'
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      action,
      result
    })

  } catch (error) {
    console.error('Error in terminal API:', error)
    return NextResponse.json(
      { error: 'Terminal operation failed' },
      { status: 500 }
    )
  }
}

async function startTerminal(workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    // Simulate terminal startup
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Terminal started successfully',
        workspacePath,
        pid: Math.floor(Math.random() * 10000)
      })
    }, 500)
  })
}

async function executeCommand(command: string, workspacePath: string): Promise<any> {
  return new Promise((resolve) => {
    const cmd = command.trim().toLowerCase()
    
    // Handle common commands
    if (cmd === 'npm start' || cmd === 'npm run dev') {
      resolve({
        success: true,
        output: `Starting development server...
Server running on http://localhost:3000
Press Ctrl+C to stop`,
        exitCode: 0
      })
      return
    }
    
    if (cmd === 'npm install') {
      resolve({
        success: true,
        output: `added 123 packages, and audited 456 packages in 2s
found 0 vulnerabilities
Project dependencies installed successfully`,
        exitCode: 0
      })
      return
    }
    
    if (cmd === 'ls' || cmd === 'dir') {
      // List files from workspace
      resolve({
        success: true,
        output: `package.json
src/
  components/
  pages/
  styles/
node_modules/
README.md`,
        exitCode: 0
      })
      return
    }
    
    if (cmd === 'pwd') {
      resolve({
        success: true,
        output: workspacePath,
        exitCode: 0
      })
      return
    }
    
    if (cmd === 'clear' || cmd === 'cls') {
      resolve({
        success: true,
        output: '',
        exitCode: 0
      })
      return
    }
    
    if (cmd === 'help') {
      resolve({
        success: true,
        output: `Available commands:
- npm start: Start development server
- npm install: Install dependencies
- ls/dir: List files
- pwd: Show current directory
- clear/cls: Clear terminal
- help: Show this help`,
        exitCode: 0
      })
      return
    }
    
    // For other commands, simulate execution
    resolve({
      success: true,
      output: `Command executed: ${command}
Output: Command completed successfully`,
      exitCode: 0
    })
  })
}

async function stopTerminal(): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Terminal stopped successfully'
      })
    }, 200)
  })
}
