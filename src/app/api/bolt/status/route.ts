import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 })
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Get or create Bolt integration
    let boltIntegration = await prisma.boltIntegration.findUnique({
      where: { projectId }
    })

    if (!boltIntegration) {
      boltIntegration = await prisma.boltIntegration.create({
        data: {
          projectId,
          provider: 'vercel',
          prodUrl: null,
          stagingUrl: null,
          lastDeployId: null
        }
      })
    }

    // Mock deployment data (in production, this would fetch from Vercel API)
    const mockDeployments = [
      {
        id: 'deploy_123456789',
        status: 'ready',
        environment: 'production',
        url: 'https://devflowhub-prod.vercel.app',
        branch: 'main',
        commitMessage: 'Update production features',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        duration: 45000
      },
      {
        id: 'deploy_987654321',
        status: 'ready',
        environment: 'staging',
        url: 'https://devflowhub-staging.vercel.app',
        branch: 'develop',
        commitMessage: 'Add new UI components',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        duration: 38000
      },
      {
        id: 'deploy_456789123',
        status: 'error',
        environment: 'staging',
        url: null,
        branch: 'feature/new-auth',
        commitMessage: 'Implement authentication system',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        duration: 0,
        error: 'Build failed: TypeScript compilation error'
      }
    ]

    // Mock environment URLs
    const environments = {
      production: {
        url: 'https://devflowhub-prod.vercel.app',
        status: 'ready',
        lastDeploy: mockDeployments[0]
      },
      staging: {
        url: 'https://devflowhub-staging.vercel.app',
        status: 'ready',
        lastDeploy: mockDeployments[1]
      }
    }

    // Log usage
    await prisma.usageLog.create({
      data: {
        projectId,
        userId: user.id,
        tool: 'BOLT',
        action: 'status_checked',
        metadata: {
          provider: boltIntegration.provider,
          environments: Object.keys(environments),
          deploymentsCount: mockDeployments.length
        }
      }
    })

    return NextResponse.json({
      success: true,
      integration: boltIntegration,
      environments,
      recentDeployments: mockDeployments,
      summary: {
        totalDeployments: mockDeployments.length,
        successfulDeployments: mockDeployments.filter(d => d.status === 'ready').length,
        failedDeployments: mockDeployments.filter(d => d.status === 'error').length,
        lastDeployment: mockDeployments[0]
      }
    })

  } catch (error) {
    console.error('Error fetching Bolt status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deployment status' },
      { status: 500 }
    )
  }
}
