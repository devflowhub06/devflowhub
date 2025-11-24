import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DeployerService } from '@/lib/deployer/service'

export async function POST(
  request: NextRequest,
  { params }: { params: { projectId: string; deployId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, deployId } = params
    const body = await request.json()
    const { targetDeploymentId } = body

    if (!targetDeploymentId) {
      return NextResponse.json(
        { error: 'Target deployment ID is required' },
        { status: 400 }
      )
    }

    const deployerService = new DeployerService()

    // Check user quota before rollback
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

    // Perform rollback
    const result = await deployerService.rollbackDeployment(
      projectId,
      session.user.id,
      targetDeploymentId
    )

    return NextResponse.json({
      success: true,
      deployment: result,
      message: `Rollback initiated successfully. New deployment ID: ${result.id}`,
      quota: {
        remaining: quota.monthlyDeploys.remaining - 1
      }
    })

  } catch (error) {
    console.error('Rollback failed:', error)
    return NextResponse.json(
      { error: 'Failed to initiate rollback', details: (error as Error).message },
      { status: 500 }
    )
  }
}