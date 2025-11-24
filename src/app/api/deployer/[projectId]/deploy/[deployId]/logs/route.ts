import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DeployerService } from '@/lib/deployer/service'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; deployId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, deployId } = params

    const deployerService = new DeployerService()
    const logs = await deployerService.getDeploymentLogs(deployId)

    return NextResponse.json({
      success: true,
      logs
    })

  } catch (error) {
    console.error('Failed to get deployment logs:', error)
    return NextResponse.json(
      { error: 'Failed to get deployment logs', details: (error as Error).message },
      { status: 500 }
    )
  }
}
