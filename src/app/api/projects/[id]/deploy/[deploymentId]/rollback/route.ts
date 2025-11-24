import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; deploymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId, deploymentId } = params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get the deployment to rollback
    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        projectId
      }
    })

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }

    if (deployment.status !== 'deployed') {
      return NextResponse.json({ error: 'Can only rollback deployed deployments' }, { status: 400 })
    }

    // Create rollback deployment
    const rollbackDeployment = await prisma.deployment.create({
      data: {
        projectId,
        environment: deployment.environment,
        branch: 'rollback',
        commitMessage: `Rollback deployment ${deploymentId}`,
        status: 'pending',
        url: deployment.url
      }
    })

    // Simulate rollback process
    setTimeout(async () => {
      try {
        // Mark original deployment as rolled back
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { status: 'rolled_back' }
        })

        // Mark rollback deployment as deployed
        await prisma.deployment.update({
          where: { id: rollbackDeployment.id },
          data: { 
            status: 'deployed',
            url: deployment.url
          }
        })

        // Log successful rollback
        await prisma.projectActivity.create({
          data: {
            projectId,
            type: 'DEPLOYMENT_ROLLBACK',
            description: `Successfully rolled back deployment ${deploymentId}`,
            metadata: {
              originalDeploymentId: deploymentId,
              rollbackDeploymentId: rollbackDeployment.id,
              environment: deployment.environment
            }
          }
        })
      } catch (error) {
        console.error('Rollback simulation error:', error)
        await prisma.deployment.update({
          where: { id: rollbackDeployment.id },
          data: { 
            status: 'failed',
            error: 'Rollback failed'
          }
        })
      }
    }, 1500) // Simulate 1.5 second rollback

    // Log rollback start
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'ROLLBACK_STARTED',
        description: `Started rollback of deployment ${deploymentId}`,
        metadata: {
          originalDeploymentId: deploymentId,
          rollbackDeploymentId: rollbackDeployment.id
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      rollbackId: rollbackDeployment.id,
      rollbackDeployment 
    })
  } catch (error) {
    console.error('Error rolling back deployment:', error)
    return NextResponse.json(
      { error: 'Failed to rollback deployment' },
      { status: 500 }
    )
  }
}
