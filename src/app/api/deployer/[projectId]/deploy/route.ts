import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DeployerService } from '@/lib/deployer/service'
import { DeployOptions } from '@/lib/deployer/types'

// GET - List deployments
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
    const service = new DeployerService()
    const deployments = await service.getDeploymentHistory(projectId, 50)
    return NextResponse.json({ success: true, deployments })

  } catch (error) {
    console.error('Failed to get deployments:', error)
    return NextResponse.json(
      { error: 'Failed to get deployments' },
      { status: 500 }
    )
  }
}

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
    const body = await request.json()

    // Validate request body
    const { 
      branch, 
      environment, 
      provider = 'vercel',
      commitHash,
      commitMessage,
      buildCommand,
      envVariables = {}
    } = body

    if (!branch || !environment) {
      return NextResponse.json(
        { error: 'Branch and environment are required' },
        { status: 400 }
      )
    }

    if (!['preview', 'staging', 'production'].includes(environment)) {
      return NextResponse.json(
        { error: 'Invalid environment. Must be preview, staging, or production' },
        { status: 400 }
      )
    }

    if (!['vercel', 'netlify', 'aws', 'gcp'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be vercel, netlify, aws, or gcp' },
        { status: 400 }
      )
    }

    // Create deploy options
    const deployOptions: DeployOptions = {
      branch,
      environment: environment as 'preview' | 'staging' | 'production',
      provider: provider as 'vercel' | 'netlify' | 'aws' | 'gcp',
      commitHash,
      commitMessage,
      buildCommand,
      envVariables
    }

    const deployerService = new DeployerService()
    
    // Check user quota before creating deployment
    const quota = await deployerService.checkUserQuota(session.user.id)
    if (quota.monthlyDeploys.remaining <= 0) {
      return NextResponse.json(
        { 
          error: 'Monthly deployment quota exceeded',
          quota 
        },
        { status: 429 }
      )
    }

    // Check if environment is allowed for user's plan
    if (!quota.environments.includes(environment)) {
      return NextResponse.json(
        { 
          error: `Environment '${environment}' not available on ${quota.plan} plan`,
          quota 
        },
        { status: 403 }
      )
    }

    // Create deployment
    const result = await deployerService.createDeployment(
      projectId,
      session.user.id,
      deployOptions
    )

    return NextResponse.json({
      success: true,
      deployment: result,
      quota: {
        remaining: quota.monthlyDeploys.remaining - 1
      }
    })

  } catch (error) {
    console.error('Deployment creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create deployment', details: (error as Error).message },
      { status: 500 }
    )
  }
}
