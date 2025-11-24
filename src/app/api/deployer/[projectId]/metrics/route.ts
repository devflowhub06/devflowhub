import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { DeployerService } from '@/lib/deployer/service'

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
    const metrics = await service.getDeploymentMetrics(projectId)
    const quota = await service.checkUserQuota(session.user.id)
    return NextResponse.json({ success: true, metrics, quota })

  } catch (error) {
    console.error('Failed to get deployment metrics:', error)
    return NextResponse.json(
      { error: 'Failed to get deployment metrics', details: (error as Error).message },
      { status: 500 }
    )
  }
}
