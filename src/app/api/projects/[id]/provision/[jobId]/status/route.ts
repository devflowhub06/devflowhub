import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id]/provision/[jobId]/status - Get provisioning status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, jobId } = params

    // Get project and verify ownership
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

    // Extract provisioning status from context
    const provisioning = (project.context as any)?.provisioning || {}
    
    if (provisioning.jobId !== jobId) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const response = {
      jobId,
      projectId,
      status: provisioning.status || 'unknown',
      currentStep: provisioning.currentStep || null,
      completedSteps: provisioning.completedSteps || [],
      progress: calculateProgress(provisioning),
      logs: provisioning.logs || [],
      error: provisioning.error || null,
      previewUrl: provisioning.previewUrl || null,
      estimatedTimeRemaining: estimateTimeRemaining(provisioning)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching provisioning status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch provisioning status' },
      { status: 500 }
    )
  }
}

// POST /api/projects/[id]/provision/[jobId]/status - Update provisioning status (internal)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; jobId: string } }
) {
  try {
    const { id: projectId, jobId } = params
    const body = await request.json()
    const { status, step, logs, error } = body

    // Update provisioning status in project context
    await prisma.project.update({
      where: { id: projectId },
      data: {
        context: {
          update: {
            provisioning: {
              jobId,
              status,
              currentStep: step,
              logs: logs || [],
              error: error || null,
              updatedAt: new Date().toISOString()
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating provisioning status:', error)
    return NextResponse.json(
      { error: 'Failed to update provisioning status' },
      { status: 500 }
    )
  }
}

// Helper functions
function calculateProgress(provisioning: any): number {
  const totalSteps = 5 // seed_files, create_git_repo, provision_sandbox, index_project, run_initial_build
  const completedSteps = provisioning.completedSteps?.length || 0
  return Math.round((completedSteps / totalSteps) * 100)
}

function estimateTimeRemaining(provisioning: any): number {
  const completedSteps = provisioning.completedSteps?.length || 0
  const totalSteps = 5
  const avgTimePerStep = 30 // seconds
  return Math.max(0, (totalSteps - completedSteps) * avgTimePerStep)
}
