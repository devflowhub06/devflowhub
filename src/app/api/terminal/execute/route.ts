import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import { ensureWorkspace } from '@/lib/projects'
import { exec } from 'child_process'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, command } = await request.json()

    if (!projectId || !command) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // Get workspace path
    const workspacePath = await ensureWorkspace(projectId)
    
    // Safety: Only allow safe commands
    const safeCommands = [
      'ls', 'dir', 'pwd', 'whoami', 'date', 'echo',
      'npm', 'yarn', 'pnpm', 'node', 'npx', 'git', 
      'cat', 'head', 'tail', 'grep', 'find', 'wc', 
      'sort', 'uniq', 'mkdir', 'rm', 'cp', 'mv',
      'python', 'python3', 'pip', 'pip3',
      'go', 'rustc', 'cargo',
      'java', 'javac', 'mvn', 'gradle'
    ]
    
    const commandParts = command.trim().split(/\s+/)
    const baseCommand = commandParts[0]
    
    if (!safeCommands.includes(baseCommand)) {
      return NextResponse.json({
        success: false,
        output: `Command '${baseCommand}' is not allowed for security reasons.\nAllowed commands: ${safeCommands.join(', ')}`,
        exitCode: 1
      })
    }

    return new Promise((resolve) => {
      exec(command, {
        cwd: workspacePath, // Use workspace path instead of process.cwd()
        shell: process.platform === 'win32',
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 * 10 // 10MB max output
      }, (error: any, stdout: string, stderr: string) => {
        const output = stdout || stderr || 'Command completed'
        const exitCode = error ? error.code || 1 : 0
        
        resolve(NextResponse.json({
          success: !error,
          output: `$ ${command}\n${output}`,
          exitCode,
          error: error ? error.message : null
        }))
      })
    })

  } catch (error) {
    console.error('Terminal execution error:', error)
    return NextResponse.json(
      { error: 'Failed to execute command' },
      { status: 500 }
    )
  }
}
