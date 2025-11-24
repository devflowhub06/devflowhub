import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

// POST /api/preview/[projectId]/[previewId]/promote - Promote preview to staging/production
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

    // Get preview environment
    const preview = await prisma.previewEnvironment.findFirst({
      where: {
        id: params.previewId,
        projectId: params.projectId,
      },
    })

    if (!preview) {
      return NextResponse.json(
        { error: 'Preview environment not found' },
        { status: 404 }
      )
    }

    if (preview.status !== 'active') {
      return NextResponse.json(
        { error: 'Preview must be active to promote' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { environment = 'staging' } = body

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        projectId: params.projectId,
        userId: session.user.id,
        version: preview.branchName,
        status: 'deploying',
        environment,
        url: environment === 'production' 
          ? `https://${project.name.toLowerCase().replace(/\s+/g, '-')}.devflowhub.com`
          : `https://staging-${project.name.toLowerCase().replace(/\s+/g, '-')}.devflowhub.com`,
        deployedBy: session.user.id,
        logs: {
          events: [
            {
              timestamp: new Date().toISOString(),
              message: `Promoting preview ${preview.id} to ${environment}`,
              level: 'info',
            },
          ],
        },
      },
    })

    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'deploy_promoted',
        eventType: 'user_action',
        userId: session.user.id,
        projectId: params.projectId,
        metadata: {
          previewId: preview.id,
          deploymentId: deployment.id,
          environment,
          branchName: preview.branchName,
        },
      },
    })

    // Simulate deployment process
    promoteToEnvironment(deployment.id, preview.id, environment).catch((error) => {
      console.error('Promotion error:', error)
    })

    return NextResponse.json({
      deployment,
      message: `Promoting to ${environment}...`,
    })
  } catch (error) {
    console.error('Error promoting preview:', error)
    return NextResponse.json(
      { error: 'Failed to promote preview' },
      { status: 500 }
    )
  }
}

async function promoteToEnvironment(
  deploymentId: string,
  previewId: string,
  environment: string
) {
  const logs: any[] = []

  try {
    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Starting promotion...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Copying assets...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: 'Updating DNS...',
      level: 'info',
    })

    await new Promise((resolve) => setTimeout(resolve, 2000))

    logs.push({
      timestamp: new Date().toISOString(),
      message: `Successfully promoted to ${environment}!`,
      level: 'success',
    })

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'deployed',
        logs: { events: logs },
        deployedAt: new Date(),
      },
    })
  } catch (error) {
    logs.push({
      timestamp: new Date().toISOString(),
      message: `Promotion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      level: 'error',
    })

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'failed',
        logs: { events: logs },
      },
    })
  }
}

