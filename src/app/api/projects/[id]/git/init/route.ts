import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// POST /api/projects/[id]/git/init - Initialize git repository for project
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
    const { 
      connectGit = false, 
      gitProvider = 'github', 
      gitRepoSettings = {},
      branchName = `assistant/init/${projectId}`
    } = body

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

    // Create project directory if it doesn't exist
    const projectDir = `/tmp/projects/${projectId}`
    
    try {
      // Initialize git repository
      await execAsync(`mkdir -p ${projectDir}`)
      await execAsync(`cd ${projectDir} && git init`)
      
      // Configure git user (use system defaults or project-specific)
      await execAsync(`cd ${projectDir} && git config user.name "DevFlowHub Assistant"`)
      await execAsync(`cd ${projectDir} && git config user.email "assistant@devflowhub.com"`)
      
      // Create initial commit
      await execAsync(`cd ${projectDir} && git add .`)
      await execAsync(`cd ${projectDir} && git commit -m "Initial commit from DevFlowHub template"`)
      
      // Create assistant branch
      await execAsync(`cd ${projectDir} && git checkout -b ${branchName}`)
      
      // If connecting to external git provider
      let remoteUrl = null
      if (connectGit && gitProvider === 'github') {
        // TODO: Create GitHub repository and get remote URL
        // For now, we'll just store the intention
        remoteUrl = `https://github.com/${session.user.name}/${project.name.toLowerCase().replace(/\s+/g, '-')}.git`
      }

      // Update project context with git information
      await prisma.project.update({
        where: { id: projectId },
        data: {
          context: {
            ...(project.context as any || {}),
            git: {
              initialized: true,
              branch: branchName,
              connected: connectGit,
              provider: gitProvider,
              remoteUrl,
              lastCommit: new Date().toISOString()
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        projectId,
        branchName,
        remoteUrl,
        connected: connectGit
      })
    } catch (gitError) {
      console.error('Git initialization error:', gitError)
      
      // Update project context with error
      await prisma.project.update({
        where: { id: projectId },
        data: {
          context: {
            ...(project.context as any || {}),
            git: {
              initialized: false,
              error: gitError instanceof Error ? gitError.message : 'Unknown git error'
            }
          }
        }
      })

      return NextResponse.json({
        success: false,
        error: 'Git initialization failed',
        details: gitError instanceof Error ? gitError.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error initializing git:', error)
    return NextResponse.json(
      { error: 'Failed to initialize git repository' },
      { status: 500 }
    )
  }
}
