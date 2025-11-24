import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { K8sRuntimeAdapter } from '@/lib/runtime/k8sAdapter'

const runtimeAdapter = new K8sRuntimeAdapter()

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { projectId, runId } = params

    // Get run from database
    const run = await prisma.run.findUnique({
      where: { id: runId },
      include: {
        project: {
          select: { userId: true }
        }
      }
    })

    if (!run) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 })
    }

    // Check permissions
    if (run.project.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get current status from runtime adapter
    let currentStatus
    try {
      currentStatus = await runtimeAdapter.getRunStatus(runId)
    } catch (error) {
      console.error('Error getting runtime status:', error)
      currentStatus = {
        runId,
        status: 'error',
        error: 'Failed to get runtime status'
      }
    }

    // Update database if status changed
    if (currentStatus.status !== run.status) {
      await prisma.run.update({
        where: { id: runId },
        data: { 
          status: currentStatus.status,
          lastPing: new Date(),
          ...(currentStatus.status === 'stopped' && { endsAt: new Date() })
        }
      })
    }

    // Get metrics if running
    let metrics
    if (currentStatus.status === 'running') {
      try {
        metrics = await runtimeAdapter.getMetrics(runId)
      } catch (error) {
        console.error('Error getting metrics:', error)
      }
    }

    return NextResponse.json({
      runId: run.id,
      projectId: run.projectId,
      branch: run.branch,
      status: currentStatus.status,
      url: run.url,
      public: run.public,
      ttlMinutes: run.ttlMinutes,
      estimatedCost: run.estimatedCost,
      startedAt: run.startsAt,
      endedAt: run.endsAt,
      health: currentStatus.health,
      metrics,
      error: currentStatus.error,
      createdAt: run.createdAt,
      lastPing: new Date()
    })

  } catch (error) {
    console.error('Run status error:', error)
    return NextResponse.json(
      { error: 'Failed to get run status' },
      { status: 500 }
    )
  }
}
