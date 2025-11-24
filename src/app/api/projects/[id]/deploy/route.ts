import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projectId = params.id
    const { environment } = await request.json()

    if (!environment || !['staging', 'production'].includes(environment)) {
      return NextResponse.json({ error: 'Invalid environment' }, { status: 400 })
    }

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

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        environment,
        branch: 'main',
        commitMessage: `Deploy ${project.name} to ${environment}`,
        status: 'pending',
        url: environment === 'staging' 
          ? `https://staging-${projectId}.devflowhub.app`
          : `https://${projectId}.devflowhub.app`
      }
    })

    // Simulate deployment process (in real implementation, this would trigger actual deployment)
    setTimeout(async () => {
      try {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: { 
            status: 'deployed',
            url: environment === 'staging' 
              ? `https://staging-${projectId}.devflowhub.app`
              : `https://${projectId}.devflowhub.app`
          }
        })

        // Log successful deployment
        await prisma.projectActivity.create({
          data: {
            projectId,
            type: 'DEPLOYMENT_SUCCESS',
            description: `Successfully deployed to ${environment}`,
            metadata: {
              deploymentId: deployment.id,
              environment,
              url: deployment.url
            }
          }
        })

        // Mark onboarding step if deploying to staging
        if (environment === 'staging') {
          await prisma.onboardingProgress.upsert({
            where: { userId: session.user.id },
            update: { deployedToStaging: true },
            create: {
              userId: session.user.id,
              deployedToStaging: true
            }
          })
        }
      } catch (error) {
        console.error('Deployment simulation error:', error)
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: { 
            status: 'failed',
            error: 'Deployment failed'
          }
        })
      }
    }, 2000) // Simulate 2 second deployment

    // Log deployment start
    await prisma.projectActivity.create({
      data: {
        projectId,
        type: 'DEPLOYMENT_STARTED',
        description: `Started deployment to ${environment}`,
        metadata: {
          deploymentId: deployment.id,
          environment
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      deploymentId: deployment.id,
      deployment 
    })
  } catch (error) {
    console.error('Error deploying:', error)
    return NextResponse.json(
      { error: 'Failed to deploy' },
      { status: 500 }
    )
  }
}
