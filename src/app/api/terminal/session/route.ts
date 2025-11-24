import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/projects'
import { spawn } from 'child_process'
import path from 'path'

// Store active terminal sessions with streaming capability
const sessions = new Map<string, {
  process: ReturnType<typeof spawn> | null
  output: string[]
  cwd: string
  projectId: string
  userId: string
  lastActivity: number
  subscribers: Set<(data: string, type: 'stdout' | 'stderr' | 'exit') => void>
}>()

// Cleanup inactive sessions (older than 1 hour)
setInterval(() => {
  const now = Date.now()
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > 3600000) { // 1 hour
      if (session.process) {
        session.process.kill('SIGTERM')
      }
      sessions.delete(sessionId)
    }
  }
}, 60000) // Check every minute

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, action, command } = await request.json()

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const workspacePath = await ensureWorkspace(projectId)
    const sessionId = `${projectId}-${session.user.id}`

    switch (action) {
      case 'create':
        // Create or get existing session
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, {
            process: null,
            output: [],
            cwd: workspacePath,
            projectId,
            userId: session.user.id,
            lastActivity: Date.now(),
            subscribers: new Set()
          })
        }
        return NextResponse.json({ 
          sessionId, 
          cwd: workspacePath,
          message: 'Terminal session ready' 
        })

      case 'execute':
        if (!command) {
          return NextResponse.json({ error: 'Command required' }, { status: 400 })
        }

        const terminalSession = sessions.get(sessionId)
        if (!terminalSession) {
          return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Execute command in the workspace
        return await executeCommandInSession(terminalSession, command)

      case 'input':
        // Send input to running process
        const activeSession = sessions.get(sessionId)
        if (!activeSession?.process) {
          return NextResponse.json({ error: 'No active process' }, { status: 400 })
        }

        if (command) {
          activeSession.process.stdin?.write(command + '\n')
          activeSession.lastActivity = Date.now()
          return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: 'Input required' }, { status: 400 })

      case 'kill':
        // Kill running process
        const killSession = sessions.get(sessionId)
        if (killSession?.process) {
          killSession.process.kill('SIGTERM')
          killSession.process = null
          killSession.lastActivity = Date.now()
        }
        return NextResponse.json({ success: true })

      case 'status':
        const statusSession = sessions.get(sessionId)
        return NextResponse.json({
          active: !!statusSession?.process,
          cwd: statusSession?.cwd || workspacePath,
          output: statusSession?.output.slice(-100) || [],
          lastActivity: statusSession?.lastActivity
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Terminal session error:', error)
    return NextResponse.json(
      { error: 'Failed to handle terminal session' },
      { status: 500 }
    )
  }
}

async function executeCommandInSession(
  session: NonNullable<ReturnType<typeof sessions.get>>,
  command: string
): Promise<NextResponse> {
  return new Promise((resolve) => {
    // Kill existing process if running
    if (session.process) {
      session.process.kill('SIGTERM')
    }

    // Parse command
    const parts = command.trim().split(/\s+/)
    const cmd = parts[0]
    const args = parts.slice(1)

    // Security: Allow safe commands
    const safeCommands = [
      'npm', 'yarn', 'pnpm', 'node', 'npx',
      'git', 'ls', 'dir', 'cat', 'grep', 'find',
      'pwd', 'cd', 'echo', 'mkdir', 'rm', 'cp', 'mv',
      'python', 'python3', 'pip', 'pip3',
      'go', 'rustc', 'cargo',
      'java', 'javac', 'mvn', 'gradle'
    ]

    if (!safeCommands.includes(cmd)) {
      return resolve(NextResponse.json({
        success: false,
        output: `Command '${cmd}' is not allowed. Allowed: ${safeCommands.join(', ')}`,
        exitCode: 1
      }))
    }

    // Spawn process in workspace directory
    const child = spawn(cmd, args, {
      cwd: session.cwd,
      shell: process.platform === 'win32',
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '1' }
    })

    session.process = child
    session.lastActivity = Date.now()
    let output = `$ ${command}\n`
    session.output.push(output)

    // Stream stdout
    child.stdout?.on('data', (data: Buffer) => {
      const text = data.toString()
      output += text
      session.output.push(text)
      // Notify subscribers (for real-time streaming)
      session.subscribers.forEach(cb => cb(text, 'stdout'))
      
      // Keep only last 1000 lines
      if (session.output.length > 1000) {
        session.output = session.output.slice(-1000)
      }
    })

    // Stream stderr
    child.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      output += text
      session.output.push(text)
      session.subscribers.forEach(cb => cb(text, 'stderr'))
    })

    // Handle exit
    child.on('close', (code) => {
      session.process = null
      session.lastActivity = Date.now()
      const exitMsg = `\n[Process exited with code ${code}]\n`
      output += exitMsg
      session.output.push(exitMsg)
      session.subscribers.forEach(cb => cb(exitMsg, 'exit'))
      
      resolve(NextResponse.json({
        success: code === 0,
        output,
        exitCode: code || 0,
        stream: false // Indicate this is final response
      }))
    })

    child.on('error', (error) => {
      session.process = null
      const errorMsg = `Error: ${error.message}\n`
      output += errorMsg
      session.output.push(errorMsg)
      session.subscribers.forEach(cb => cb(errorMsg, 'stderr'))
      
      resolve(NextResponse.json({
        success: false,
        output,
        exitCode: 1,
        error: error.message
      }))
    })

    // For long-running commands, return immediately with streaming indicator
    if (['npm', 'yarn', 'pnpm', 'node'].includes(cmd) && args.includes('run')) {
      setTimeout(() => {
        if (child && !child.killed) {
          resolve(NextResponse.json({
            success: true,
            output: output,
            exitCode: null,
            stream: true,
            pid: child.pid
          }))
        }
      }, 100)
    }
  })
}

// GET endpoint for polling terminal output (for non-WebSocket clients)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const sessionId = `${projectId}-${session.user.id}`
    const terminalSession = sessions.get(sessionId)

    if (!terminalSession) {
      return NextResponse.json({ 
        active: false,
        output: [],
        message: 'No active session' 
      })
    }

    return NextResponse.json({
      active: !!terminalSession.process,
      output: terminalSession.output,
      cwd: terminalSession.cwd,
      lastActivity: terminalSession.lastActivity
    })
  } catch (error) {
    console.error('Terminal status error:', error)
    return NextResponse.json(
      { error: 'Failed to get terminal status' },
      { status: 500 }
    )
  }
}

