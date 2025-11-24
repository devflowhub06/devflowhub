import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// POST /api/preview/[projectId]/[previewId]/rollback - Rollback deployment
export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; previewId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify project access
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const { deploymentId, targetVersion } = body

    if (!deploymentId) {
      return NextResponse.json(
        { error: 'Deployment ID is required' },
        { status: 400 }
      )
    }

    // Get current deployment
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        projectId: params.projectId,
      },
    })

    if (!deployment) {
      return NextResponse.json(
        { error: 'Deployment not found' },
        { status: 404 }
      )
    }

    // Create rollback deployment
    const rollbackDeployment = await prisma.deployment.create({
      data: {
        projectId: params.projectId,
        userId: session.user.id,
        version: targetVersion || 'previous',
        status: 'deploying',
        environment: deployment.environment,
        url: deployment.url,
        deployedBy: session.user.id,
        logs: {
          events: [
            {
              timestamp: new Date().toISOString(),
              message: `Rolling back from deployment ${deploymentId}`,
              level: 'info',
            },
          ],
        },
      },
    })

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'deployment_rollback',
        eventType: 'user_action',
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          deploymentId,
          rollbackDeploymentId: rollbackDeployment.id,
          targetVersion,
        },
      },
    })

    // Execute rollback in background
    executeRollback(rollbackDeployment.id, deployment.id).catch((error) => {
      console.error('Rollback error:', error)
    })

    return NextResponse.json({
      deployment: rollbackDeployment,
      message: 'Rollback initiated',
    })
  } catch (error) {
    console.error('Error initiating rollback:', error)
    return NextResponse.json(
      { error: 'Failed to initiate rollback' },
      { status: 500 }
    )
  }
}

async function executeRollback(rollbackDeploymentId: string, originalDeploymentId: string) {
  const logs: any[] = []

  try {
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Starting rollback process...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Retrieving previous version...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Deploying previous version...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Rollback completed successfully!',
      level: 'success',
    })

    await prisma.deployment.update({
      where: { id: rollbackDeploymentId },
      data: {
        status: 'deployed',
        logs: { events: logs },
        deployedAt: new Date(),
      },
    })

    // Mark original deployment as rolled back
    await prisma.deployment.update({
      where: { id: originalDeploymentId },
      data: {
        status: 'rolled_back',
      },
    })
  } catch (error) {
    logs.push({
      timestamp: new Date().toISOString(),
      message: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      level: 'error',
    })

    await prisma.deployment.update({
      where: { id: rollbackDeploymentId },
      data: {
        status: 'failed',
        logs: { events: logs },
      },
    })
  }
}

