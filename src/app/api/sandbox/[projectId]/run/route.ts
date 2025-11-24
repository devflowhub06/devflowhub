import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { K8sRuntimeAdapter } from '@/lib/runtime/k8sAdapter'
import { SnapshotService } from '@/lib/storage/snapshot'

const runtimeAdapter = new K8sRuntimeAdapter()

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params
    const { 
      branch = 'main', 
      env = {}, 
      public: isPublic = false, 
      ttlMinutes = 60,
      snapshotBeforeRun = true,
      buildCommand,
      startCommand,
      framework
    } = await request.json()

    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        id: true, 
        name: true, 
        language: true, 
        framework: true,
        userId: true 
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check user permissions
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create snapshot before run if requested
    let snapshotId: string | undefined
    if (snapshotBeforeRun) {
      try {
        snapshotId = await SnapshotService.createSnapshot(
          projectId,
          session.user.id,
          `Sandbox run - ${branch}`
        )
        console.log(`Created snapshot ${snapshotId} before run`)
      } catch (error) {
        console.warn('Failed to create snapshot, continuing without:', error)
      }
    }

    // Prepare runtime options
    const runtimeOptions = {
      projectId: projectId,
      branch: branch,
      userId: session.user.id,
      env: {
        NODE_ENV: 'development',
        ...env
      },
      public: isPublic,
      ttlMinutes: ttlMinutes,
      snapshotBeforeRun: snapshotBeforeRun,
      buildCommand: buildCommand || getDefaultBuildCommand(project.framework || project.language),
      startCommand: startCommand || getDefaultStartCommand(project.framework || project.language),
      framework: framework || project.framework || project.language
    }

    // Create runtime via adapter
    const runResult = await runtimeAdapter.createRun(runtimeOptions)

    // Store run in database
    const run = await prisma.run.create({
      data: {
        id: runResult.runId,
        projectId,
        branch,
        createdBy: session.user.id,
        status: runResult.status,
        url: runResult.url,
        snapshotId,
        estimatedCost: runResult.estimatedCost,
        env: env,
        public: isPublic,
        ttlMinutes: ttlMinutes,
        startsAt: new Date()
      }
    })

    return NextResponse.json({
      runId: run.id,
      status: run.status,
      url: run.url,
      estimatedCost: run.estimatedCost,
      snapshotId,
      createdAt: run.createdAt,
      message: 'Runtime creation initiated'
    })

  } catch (error) {
    console.error('Sandbox run creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create sandbox runtime' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId } = params

    // Get all runs for project
    const runs = await prisma.run.findMany({
      where: { 
        projectId,
        createdBy: session.user.id
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Get current status from adapter for active runs
    const runsWithStatus = await Promise.all(
      runs.map(async (run) => {
        if (run.status === 'running' || run.status === 'starting') {
          try {
            const currentStatus = await runtimeAdapter.getRunStatus(run.id)
            return {
              ...run,
              status: currentStatus.status,
              health: currentStatus.health
            }
          } catch (error) {
            return run
          }
        }
        return run
      })
    )

    return NextResponse.json({ runs: runsWithStatus })

  } catch (error) {
    console.error('Error fetching runs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    )
  }
}

/**
 * Helper functions for default commands
 */
function getDefaultBuildCommand(framework: string): string {
  const buildCommands: Record<string, string> = {
    'nextjs': 'npm run build',
    'react': 'npm run build',
    'vue': 'npm run build',
    'angular': 'npm run build',
    'node': 'npm install',
    'python': 'pip install -r requirements.txt',
    'go': 'go build',
    'rust': 'cargo build --release'
  }
  
  return buildCommands[framework] || 'npm install'
}

function getDefaultStartCommand(framework: string): string {
  const startCommands: Record<string, string> = {
    'nextjs': 'npm run dev',
    'react': 'npm start',
    'vue': 'npm run serve',
    'angular': 'npm run start',
    'node': 'npm start',
    'python': 'python app.py',
    'go': './main',
    'rust': './target/release/app'
  }
  
  return startCommands[framework] || 'npm start'
}
